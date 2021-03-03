package cameraguys.project;

import cameraguys.project.http.ConnectionInformation;
import cameraguys.project.http.HttpFileUpload;
import cameraguys.project.socketio.SocketIOBroadcaster;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Slider;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.videoio.VideoCapture;
import org.opencv.videoio.VideoWriter;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Timer;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ClientWindow {

    public static final int fps = 10;
    private static final double MIN_AREA = 50;//Disturbance has to be more than this area to be identified.
    private static final String NOTIFY_ENDPOINT = "/api/notify";
    private static ClientWindow inst;
    private static Timer tmrVideoProcess;
    private final ConnectionInformation connInfo = ConnectionInformation.load();
    private final VideoCapture capture = new VideoCapture();
    private final Mat camFrame = new Mat();
    private final Mat diffFrame = new Mat();
    private final Mat displayFrame = new Mat();
    private final Mat processingFrame = new Mat();
    private final VideoWriter writer = new VideoWriter();
    private final boolean outlineSmallerContours = false;
    private final boolean outlineAll = true;
    private final SocketIOBroadcaster socketio = new SocketIOBroadcaster();
    @FXML
    private Button startBtn;
    @FXML
    private ImageView currentFrame, filters;
    @FXML
    private Slider slider;
    private File outFile = null; //Set upon motion detected.
    private long initialMotion = 0l;
    private long lastMotion = 0l;
    private long lastGC = System.currentTimeMillis();
    private boolean cameraActive = false;
    private boolean motionDetected = false,
            sentNotif = false;
    private ScheduledExecutorService timer;
    //    private static HttpStreamServer httpStreamService;
    private int stage = 0;

    public ClientWindow() {
        inst = this;
        socketio.start();
    }

    public static ClientWindow inst() {
        return inst;
    }

    @FXML
    protected void startCamera(ActionEvent event) {
        if (startBtn.getText().equals("Stop Camera")) {
            startBtn.setText("Start Camera");
            stopVideo();

            if (System.currentTimeMillis() - initialMotion >= 3000 && lastMotion - initialMotion < 2000) {
                System.out.println("Deleting useless video.");
                outFile.delete();
            } else {
                //If there has been motion in the last 10 seconds, process the video.
                if (System.currentTimeMillis() - lastMotion > TimeUnit.SECONDS.toMillis(10)) {
                    System.out.println("Motion has ceased.");
                    sendVideoToServer();
                }
            }
        } else {
            startBtn.setText("Stop Camera");

            Runnable frameGrabber = getGrabber();
            this.timer = Executors.newSingleThreadScheduledExecutor();
            this.timer.scheduleAtFixedRate(frameGrabber, 0, (long) (1000d / fps), TimeUnit.MILLISECONDS);

//        httpStreamService = new HttpStreamServer(displayFrame);
//        new Thread(httpStreamService).start();
        }
    }

    public ArrayList<Rect> findContours(Mat inputmat) {
        Mat v = new Mat();
        List<MatOfPoint> contours = new ArrayList<>();
        Imgproc.findContours(inputmat, contours, v, Imgproc.RETR_LIST,
                Imgproc.CHAIN_APPROX_SIMPLE);

        int maxAreaIdx;
        Rect r;
        ArrayList<Rect> rect_array = new ArrayList<>();
        Rect masterRect;
        Point min = null;
        Point max = null;

        for (int idx = 0; idx < contours.size(); idx++) {
            MatOfPoint contour = contours.get(idx);
            double contourarea = Imgproc.contourArea(contour);
            if (contourarea > MIN_AREA) {
                maxAreaIdx = idx;
                r = Imgproc.boundingRect(contours.get(maxAreaIdx));
                if (outlineSmallerContours) {
                    rect_array.add(r);
                }

                if (min == null) min = new Point(r.x, r.y);
                if (max == null) max = new Point(r.x, r.y);

                if (r.x < min.x) min.x = r.x;
                if (r.y < min.y) min.y = r.y;
                if (r.x + r.width > max.x) max.x = r.x + r.width;
                if (r.y + r.height > max.y) max.y = r.y + r.height;

                //This draws outline on the final image with red contours.
//                Imgproc.drawContours(ret, contours, maxAreaIdx, new Scalar(0, 0, 255));
            }
        }

        contours.forEach(cont -> cont.free());
        contours.clear();

        if (min != null && max != null) {
            masterRect = new Rect((int) min.x, (int) min.y, (int) (max.x - min.x), (int) (max.y - min.y));
            if (outlineAll) {
                rect_array.add(masterRect);
            }
        }

        v.free();
        return rect_array;

    }

    public void processFrame(Mat initialFrame) {
        initialFrame.copyTo(displayFrame); //Clone it for display purposes.
        initialFrame.copyTo(processingFrame); //This will be changed based on slider to show progress in filters.

        if (initialFrame.empty()) return;

        Imgproc.cvtColor(initialFrame, initialFrame, Imgproc.COLOR_BGRA2GRAY); //Convert to grayscale
        if (((int) slider.getValue()) == 0) initialFrame.copyTo(processingFrame);
        Imgproc.GaussianBlur(initialFrame, initialFrame, new Size(5, 5), 0); //Blur the image a little to de-noise
        if (((int) slider.getValue()) == 1) initialFrame.copyTo(processingFrame);

        if (diffFrame.empty() || diffFrame.width() != initialFrame.width())
            initialFrame.copyTo(diffFrame);

        Core.subtract(initialFrame, diffFrame, diffFrame); //Subtract the previous frame from the current frame.
        if (((int) slider.getValue()) == 2) diffFrame.copyTo(processingFrame);
        Imgproc.adaptiveThreshold(diffFrame, diffFrame, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY_INV, 5, 2);
        if (((int) slider.getValue()) == 3) diffFrame.copyTo(processingFrame);

        List<Rect> array = findContours(diffFrame);
        int index = 0;
        if (array.size() > 0) { // Apply the rectangles to the displayFrame
            if (!motionDetected) {
                System.out.println("Detected motion. Writing video.");
                initialMotion = System.currentTimeMillis();
                System.out.println(DateUtils.formatString(initialMotion));
                outFile = new File("footage", DateUtils.formatString(initialMotion) + ".mp4");
            }

            motionDetected = true;
            lastMotion = System.currentTimeMillis();

            for (Rect rect : array) {
                boolean isLast = index++ == array.size() - 1;
                int thickness = (isLast ? 3 : 1);
                Scalar color = isLast ? new Scalar(0, 0, 255) : new Scalar(0, 255, 0);
                Imgproc.rectangle(displayFrame, rect.br(), rect.tl(),
                        color,
                        thickness);
            }

        }

        if (((int) slider.getValue()) == 4) displayFrame.copyTo(processingFrame);

        MatOfByte buffer = new MatOfByte();
        Imgcodecs.imencode(".png", displayFrame, buffer);
        MatOfByte buf2 = new MatOfByte();
        Imgcodecs.imencode(".png", processingFrame, buf2);

        if (motionDetected) {
            //If it's been at least 3 seconds since the last motion and there hasn't been sustained motion, scrap the recording.
            if (System.currentTimeMillis() - initialMotion >= 3000 && lastMotion - initialMotion < 2000) {
                System.out.println("Deleting useless video.");
                stopVideo();
                outFile.delete();
            } else {
                if (!sentNotif && System.currentTimeMillis() - initialMotion >= 3000) {
                    sentNotif = true;
                    sendEmail(buffer);
                }
                //If there has been motion in the last 10 seconds, process the video.
                if (System.currentTimeMillis() - lastMotion < TimeUnit.SECONDS.toMillis(10)) {
//                    System.out.println("Write frame");
                    Mat mat = new Mat();
                    displayFrame.copyTo(mat);
                    processVideo(mat);
                    mat.free();
                } else {
                    System.out.println("Motion has ceased.");
                    stopVideo();
                    sendVideoToServer();
                }
            }
        }

//        httpStreamService.imag = displayFrame;
        ByteArrayInputStream bin = new ByteArrayInputStream(buffer.toArray());
        ByteArrayInputStream bin2 = new ByteArrayInputStream(buf2.toArray());
        Image img1 = new Image(bin);
        Image img2 = new Image(bin2);
        currentFrame.setImage(img1);
        filters.setImage(img2);
        initialFrame.copyTo(diffFrame); //Update diffFrame
        try {
            bin.close();
            bin2.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        buffer.release();
        buf2.release();
        if (System.currentTimeMillis() - lastGC > 10000) {
            System.gc();

            lastGC = System.currentTimeMillis();
        }
    }

    private void sendEmail(MatOfByte buffer) {
        Thread thread = new Thread(() -> {
            System.out.println("Uploading thumbnail.");
            File file = new File("footage", "tmp.png");
            try {
                FileOutputStream out = new FileOutputStream(file);
                ByteArrayInputStream in = new ByteArrayInputStream(buffer.toArray());
                int data;
                while ((data = in.read()) != -1) {
                    out.write(data);
                }

                out.close();
                in.close();
                System.out.println("Saved image. Executing post");

                HashMap<String, String> formData = new HashMap<>();
                formData.put("name", connInfo.getName());
                formData.put("userEmail", connInfo.getEmail());
                HttpFileUpload imgData = new HttpFileUpload(connInfo.getUrl() + NOTIFY_ENDPOINT, file, formData);
                imgData.uploadImage();
            } catch (IOException e) {
                System.err.println("Could not send email notification!");
                e.printStackTrace();
            }
        });
        thread.start();
    }

    private void stopFrames() {
        if (this.timer != null && !this.timer.isShutdown()) {
            try {
                // stop the timer
                this.timer.shutdown();
                this.timer.awaitTermination((long) (1000d / fps), TimeUnit.MILLISECONDS);
            } catch (InterruptedException e) {
                // log any exception
                System.err.println("Exception in stopping the frame capture, trying to release the camera now... " + e);
            }
        }

        if (this.capture != null) {
            // release the camera
            this.capture.release();
        }

        cameraActive = false;
    }

    public void setClosed() {
        stopFrames();
        stopVideo();
        socketio.kill();

//        if (httpStreamService != null && httpStreamService.isRunning())
//            httpStreamService.stopServer();
    }

    private void processVideo(Mat frame) {
        if (!writer.isOpened()) {
//            int fourcc = VideoWriter.fourcc('M', 'P', '4', 'V');
            int fourcc = VideoWriter.fourcc('H', '2', '6', '4');
            if (!outFile.exists())
                outFile.getParentFile().mkdirs();
            writer.open(outFile.getAbsolutePath(), fourcc, fps, frame.size());
        }

        if (writer.isOpened()) {
            writer.write(frame);
        } else {
            System.err.println("Could not write video.");
        }
    }

    private void stopVideo() {
        sentNotif = false;
        motionDetected = false;
        if (writer != null)
            writer.release();
    }

    private void sendVideoToServer() {
        File file = new File(outFile.getAbsolutePath());
        //TODO Actually send it, wait for response, and delete local file.
        System.out.println("Uploading video....");
    }

    private void openCamera() {
        if (!cameraActive) {
            System.out.println("Attempting to open feed.");
            cameraActive = capture.open(0, 700);
            if (cameraActive)
                System.out.println("Feed opened.");
            else
                System.out.println("Could not start camera feed.");
        }
    }

    private Runnable getGrabber() {
        return () -> {
            openCamera();
            if (this.capture.isOpened()) {
                this.capture.read(camFrame); //Write the current capture to initialFrame
                processFrame(camFrame);
            } else {
                System.err.println("Camera feed not started!");
            }
        };
    }

}

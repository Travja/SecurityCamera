package cameraguys.project;

import cameraguys.project.webserver.HttpStreamServer;
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

import javax.swing.*;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ClientWindow {

    private static final double MIN_AREA = 50;//Disturbance has to be more than this area to be identified.
    static Timer tmrVideoProcess;
    private static HttpStreamServer httpStreamService;
    @FXML
    private Button startBtn;
    @FXML
    private ImageView currentFrame, filters;
    @FXML
    private Slider slider;
    private VideoCapture capture;
    private ScheduledExecutorService timer;
    private boolean cameraActive = false;
    private Mat diffFrame, displayFrame;
    private int stage = 0;
    private boolean outlineSmallerContours = false, outlineAll = true;

    private VideoWriter writer = null;
    private File outFile = null; //Set upon motion detected.

    private boolean motionDetected = false;
    private long initialMotion = 0l;
    private long lastMotion = 0l;

    public ArrayList<Rect> findContours(Mat outmat) {
        Mat v = new Mat();
        Mat vv = outmat.clone();
        List<MatOfPoint> contours = new ArrayList<>();
        Imgproc.findContours(vv, contours, v, Imgproc.RETR_LIST,
                Imgproc.CHAIN_APPROX_SIMPLE);

        int maxAreaIdx;
        Rect r;
        ArrayList<Rect> rect_array = new ArrayList<>();
        Rect masterRect;
        Point min = null;
        Point max = null;

        for (int idx = 0; idx < contours.size(); idx++) {
            Mat contour = contours.get(idx);
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
        if (min != null && max != null) {
            masterRect = new Rect((int) min.x, (int) min.y, (int) (max.x - min.x), (int) (max.y - min.y));
            if (outlineAll)
                rect_array.add(masterRect);
        }

        v.release();
        return rect_array;

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

    @FXML
    protected void startCamera(ActionEvent event) {
        capture = new VideoCapture();
        httpStreamService = new HttpStreamServer(displayFrame);
        new Thread(httpStreamService).start();
        Runnable frameGrabber = getGrabber();
        this.timer = Executors.newSingleThreadScheduledExecutor();
        this.timer.scheduleAtFixedRate(frameGrabber, 0, 33, TimeUnit.MILLISECONDS);
    }

    private Runnable getGrabber() {
        return () -> {
            openCamera();
            if (this.capture.isOpened()) {
                Mat initialFrame = new Mat();
                this.capture.read(initialFrame); //Write the current capture to initialFrame
                displayFrame = initialFrame.clone(); //Clone it for display purposes.
                Mat processingFrame = initialFrame.clone(); //This will be changed based on slider to show progress in filters.

                Imgproc.cvtColor(initialFrame, initialFrame, Imgproc.COLOR_BGR2GRAY); //Convert to grayscale
                if (((int) slider.getValue()) == 0) processingFrame = initialFrame.clone();
                Imgproc.GaussianBlur(initialFrame, initialFrame, new Size(5, 5), 0); //Blur the image a little to de-noise
                if (((int) slider.getValue()) == 1) processingFrame = initialFrame.clone();

                if (diffFrame == null) //Initialize the diffFrame if it hasn't already been set.
                    diffFrame = initialFrame.clone();

                Core.subtract(initialFrame, diffFrame.clone(), diffFrame); //Subtract the previous frame from the current frame.
                if (((int) slider.getValue()) == 2) processingFrame = diffFrame.clone();
                Imgproc.adaptiveThreshold(diffFrame, diffFrame, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY_INV, 5, 2);
                if (((int) slider.getValue()) == 3) processingFrame = diffFrame.clone();

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

                if (motionDetected) {
                    //If it's been at least 3 seconds since the last motion and there hasn't been sustained motion, scrap the recording.
                    if (System.currentTimeMillis() - initialMotion >= 3000 && lastMotion - initialMotion < 2000) {
                        System.out.println("Deleting useless video.");
                        stopVideo();
                        outFile.delete();
                    } else {

                        //If there has been motion in the last 10 seconds, process the video.
                        if (System.currentTimeMillis() - lastMotion < TimeUnit.SECONDS.toMillis(10))
                            processVideo(displayFrame);
                        else {
                            System.out.println("Motion has ceased.");
                            stopVideo();
                        }
                    }
                }

                if (((int) slider.getValue()) == 4) processingFrame = displayFrame.clone();

                MatOfByte buffer = new MatOfByte();
                Imgcodecs.imencode(".png", displayFrame, buffer);
                MatOfByte buf2 = new MatOfByte();
                Imgcodecs.imencode(".png", processingFrame, buf2);

                httpStreamService.imag = displayFrame;
                currentFrame.setImage(new Image(new ByteArrayInputStream(buffer.toArray())));
                filters.setImage(new Image(new ByteArrayInputStream(buf2.toArray())));
                diffFrame = initialFrame; //Update diffFrame
            } else {
                System.err.println("Camera feed not started!");
            }
        };
    }

    private void stopFrames() {
        if (this.timer != null && !this.timer.isShutdown()) {
            try {
                // stop the timer
                this.timer.shutdown();
                this.timer.awaitTermination(33, TimeUnit.MILLISECONDS);
            } catch (InterruptedException e) {
                // log any exception
                System.err.println("Exception in stopping the frame capture, trying to release the camera now... " + e);
            }
        }

        if (this.capture != null && this.capture.isOpened()) {
            // release the camera
            this.capture.release();
        }

        cameraActive = false;
    }

    public void setClosed() {
        stopFrames();
        stopVideo();
        if (httpStreamService != null && httpStreamService.isRunning())
            httpStreamService.stopServer();
    }

    private void processVideo(Mat frame) {
        if (writer == null || !writer.isOpened()) {
//            int fourcc = VideoWriter.fourcc('M', 'P', '4', 'V');
            int fourcc = VideoWriter.fourcc('H', '2', '6', '4');
            if (!outFile.exists())
                outFile.getParentFile().mkdirs();
            writer = new VideoWriter(outFile.getAbsolutePath(), fourcc, 1000d / 33d, frame.size());
        }

        if (writer.isOpened())
            writer.write(frame);
        else {
            System.err.println("Could not write video.");
        }
    }

    private void stopVideo() {
        motionDetected = false;
        if (writer != null && writer.isOpened())
            writer.release();
    }
}

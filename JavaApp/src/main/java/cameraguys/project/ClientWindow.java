package cameraguys.project;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.videoio.VideoCapture;
import org.opencv.videoio.VideoWriter;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ClientWindow {

    @FXML
    private Button startBtn;
    @FXML
    private ImageView currentFrame, filters;

    private VideoCapture capture;
    private ScheduledExecutorService timer;
    private boolean cameraActive = false;

    private Mat diffFrame, ret;

    public ArrayList<Rect> findContours(Mat outmat) {
        Mat v = new Mat();
        Mat vv = outmat.clone();
        List<MatOfPoint> contours = new ArrayList<>();
        Imgproc.findContours(vv, contours, v, Imgproc.RETR_LIST,
                Imgproc.CHAIN_APPROX_SIMPLE);

        double maxArea = 100;
        int maxAreaIdx;
        Rect r;
        ArrayList<Rect> rect_array = new ArrayList<Rect>();

        for (int idx = 0; idx < contours.size(); idx++) {
            Mat contour = contours.get(idx);
            double contourarea = Imgproc.contourArea(contour);
            if (contourarea > maxArea) {
                maxAreaIdx = idx;
                r = Imgproc.boundingRect(contours.get(maxAreaIdx));
                rect_array.add(r);
                //This draws outline on the final image with red contours.
//                Imgproc.drawContours(ret, contours, maxAreaIdx, new Scalar(0, 0, 255));
            }
        }

        v.release();

        return rect_array;

    }
    VideoWriter writer = new VideoWriter();

    @FXML
    protected void startCamera(ActionEvent event) {
        capture = new VideoCapture();
        Runnable frameGrabber = () -> {
            if (!cameraActive) {
                System.out.println("Attempting to open feed.");
                cameraActive = capture.open(0, 700);
                if (cameraActive)
                    System.out.println("Feed opened.");
                else
                    System.out.println("Could not start camera feed.");
            }
            if (this.capture.isOpened()) {
                Mat frame = new Mat();
                this.capture.read(frame);
                ret = frame.clone();
                Imgproc.cvtColor(frame, frame, Imgproc.COLOR_BGR2GRAY);
                Imgproc.GaussianBlur(frame, frame, new Size(3, 3), 0);

                if (diffFrame == null)
                    diffFrame = frame.clone();

                Mat tempFrame = diffFrame.clone();
                Core.subtract(frame, tempFrame, diffFrame);
                Imgproc.adaptiveThreshold(diffFrame, diffFrame, 255, Imgproc.ADAPTIVE_THRESH_MEAN_C, Imgproc.THRESH_BINARY_INV, 5, 2);

                List<Rect> array = findContours(diffFrame);
                if (array.size() > 0) {

                    array.forEach(rect -> Imgproc.rectangle(ret, rect.br(), rect.tl(),
                            new Scalar(0, 255, 0), 1));

                }

                MatOfByte buffer = new MatOfByte();
                Imgcodecs.imencode(".png", ret, buffer);
                MatOfByte buf2 = new MatOfByte();
                Imgcodecs.imencode(".png", diffFrame, buf2);

                currentFrame.setImage(new Image(new ByteArrayInputStream(buffer.toArray())));
                filters.setImage(new Image(new ByteArrayInputStream(buf2.toArray())));
                diffFrame = frame;
            } else {
                System.err.println("Could not start camera feed.");
            }
        };
        this.timer = Executors.newSingleThreadScheduledExecutor();
        this.timer.scheduleAtFixedRate(frameGrabber, 0, 33, TimeUnit.MILLISECONDS);

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

        if (this.capture.isOpened()) {
            // release the camera
            this.capture.release();
        }

        cameraActive = false;
    }

    public void setClosed() {
        this.stopFrames();
    }
}

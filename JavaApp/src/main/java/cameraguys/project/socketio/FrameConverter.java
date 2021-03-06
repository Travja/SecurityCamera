package cameraguys.project.socketio;

import cameraguys.project.ClientWindow;
import dev.onvoid.webrtc.media.video.I420Buffer;
import dev.onvoid.webrtc.media.video.VideoFrame;
import org.opencv.core.CvType;
import org.opencv.core.Mat;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.nio.ByteBuffer;

public class FrameConverter {

    private static boolean processing = false;

    /**
     * Starts the conversion process for the {@link VideoFrame}
     * and pushes the frame over to OpenCV to handle processing.
     *
     * @param videoFrame {@link VideoFrame}
     */
    public static void queue(VideoFrame videoFrame) {
        if (processing) return;

        processing = true;
        I420Buffer raw = videoFrame.buffer.toI420();
        convertAndSendMat(raw);
        raw.release();
        processing = false;
    }

    /**
     * Converts the I420 buffer into RGB and sends the constructed
     * {@link Mat} to OpenCV for processing.
     * @param raw The {@link I420Buffer} to convert
     */
    private static void convertAndSendMat(I420Buffer raw) {
        int length = raw.getStrideU();

        ByteBuffer y = raw.getDataY();
        ByteBuffer u = raw.getDataU();
        ByteBuffer v = raw.getDataV();

        Mat mat = new Mat(raw.getHeight(), raw.getWidth(), CvType.CV_8UC3);

        int row = 0;
        int column = 0;

        /*
        YUV formatting consists of a long string of Y bytes. These Y bytes,
        applied with the U and V bytes applicable for their sector, make up the
        coloring of the image. This simply lines up the YUV sectors and converts
        each piece into its RGB counterpart and puts it into the Mat above.

        For more information about YUV, see:
        https://en.wikipedia.org/wiki/YUV#Y%E2%80%B2UV420p_(and_Y%E2%80%B2V12_or_YV12)_to_RGB888_conversion
        https://wiki.videolan.org/YUV
         */
        while (y.hasRemaining()) {
            byte y1 = y.get();
            byte y2 = y.get();
            byte y3 = y.get();
            byte y4 = y.get();

            int r = (int) Math.floor(row / 2d);
            int c = (int) Math.floor(column / 2d);

            int upos = r * length + c;

            u.position(upos);
            v.position(upos);

            byte u1 = u.get();
            byte v1 = v.get();

            byte[] val = toRgb(y1, u1, v1);
            byte[] val2 = toRgb(y2, u1, v1);
            mat.put(row, column++, val);
            mat.put(row, column++, val2);


            if (column >= length * 2) {
                column = 0;
                row++;
            }

            //Update upos again
            r = (int) Math.floor(row / 2d);
            c = (int) Math.floor(column / 2d);

            upos = r * length + c;

            u.position(upos);
            v.position(upos);

            u1 = u.get();
            v1 = v.get();

            byte[] val3 = toRgb(y3, u1, v1);
            byte[] val4 = toRgb(y4, u1, v1);
            mat.put(row, column++, val3);
            mat.put(row, column++, val4);


            if (column >= length * 2) {
                column = 0;
                row++;
            }
        }

        ClientWindow.inst().processFrame(mat);
        mat.free();
    }

    /**
     * @deprecated No longer intended for use.
     * Converts a given Image into a BufferedImage
     *
     * @param img The Image to be converted
     * @return The converted BufferedImage
     */
    public static BufferedImage toBufferedImage(Image img) {
        // Create a buffered image with transparency
        BufferedImage bimage = new BufferedImage(img.getWidth(null), img.getHeight(null), BufferedImage.TYPE_INT_ARGB);

        // Draw the image on to the buffered image
        Graphics2D bGr = bimage.createGraphics();
        bGr.drawImage(img, null, null);
        bGr.dispose();

        // Return the buffered image
        return bimage;
    }

    private static byte[] toRgb(int yValue, int uValue, int vValue) {

        if (yValue < 0) yValue = yValue + 255;
        if (uValue < 0) uValue = uValue + 255;
        if (vValue < 0) vValue = vValue + 255;

        /*
        These are just slightly different algorithms to convert the color value.
        It seems that the current coloring is a little off still, but these methods
        were more off than what is currently being used.
         */
        //YUV420 (444?)
//        int rTmp = (int) (yValue + (1.370705 * (vValue - 128)));
//        int gTmp = (int) (yValue - (0.698001 * (vValue - 128)) - (0.337633 * (uValue - 128)));
//        int bTmp = (int) (yValue + (1.732446 * (uValue - 128)));
        // or fast integer computing with a small approximation
//        int rTmp = yValue + (351 * (vValue - 128)) >> 8;
//        int gTmp = yValue - (179 * (vValue - 128) + 86 * (uValue - 128)) >> 8;
//        int bTmp = yValue + (443 * (uValue - 128)) >> 8;


        //YUV422
        int rTmp = (int) (yValue + (1.402 * (vValue - 128)));
        int gTmp = (int) (yValue - (0.344 * (vValue - 128)) - (0.714 * (uValue - 128)));
        int bTmp = (int) (yValue + (1.772 * (uValue - 128)));


        byte[] ret = new byte[3];
        ret[2] = clamp(rTmp, 0, 255);
        ret[1] = clamp(gTmp, 0, 255);
        ret[0] = clamp(bTmp, 0, 255);
        return ret;
    }

    public static byte clamp(int val, int min, int max) {
        if (val > min && val < max) return (byte) val;
        else if (val < min) return (byte) min;
        else return (byte) max;
    }

}

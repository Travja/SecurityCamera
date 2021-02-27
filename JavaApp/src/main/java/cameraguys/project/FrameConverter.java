package cameraguys.project;

import dev.onvoid.webrtc.media.video.I420Buffer;
import dev.onvoid.webrtc.media.video.VideoFrame;
import org.opencv.core.CvType;
import org.opencv.core.Mat;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.nio.ByteBuffer;
import java.util.LinkedList;

public class FrameConverter {

    private static LinkedList<I420Buffer> stack = new LinkedList<>();
    private static boolean started = false;
    private static boolean processing = false;

    public static void queue(VideoFrame videoFrame) {
        if (!processing) {
            processing = true;
            I420Buffer raw = videoFrame.buffer.toI420();
            convertAndSendMat(raw);
            raw.release();
            videoFrame.release();
            processing = false;
        } else {
            videoFrame.release();
        }
//        stack.addLast(raw);
//        start();
    }

    private static void start() {
        if (started) return;

        started = true;
        new Thread(() -> {
            while (true) {

                if (stack.size() > 0) {
                    I420Buffer raw = stack.getFirst();
                    convertAndSendMat(raw);
                    stack.pop();
                    raw.release();
//                try {
//                    Thread.sleep(33);
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
                }
            }
        }).start();
    }

    private static void convertAndSendMat(I420Buffer raw) {
        int bufferSize = raw.getWidth() * raw.getHeight() * 4;

        int length = raw.getStrideU();

        ByteBuffer y = raw.getDataY();
        ByteBuffer u = raw.getDataU();
        ByteBuffer v = raw.getDataV();

        Mat mat = new Mat(raw.getHeight(), raw.getWidth(), CvType.CV_8UC3);

        int row = 0;
        int column = 0;

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
        if (y.isDirect())
            ClientWindow.clean(y);
        if (u.isDirect())
            ClientWindow.clean(u);
        if (v.isDirect())
            ClientWindow.clean(v);

//        ByteBuffer buff = ByteBuffer.allocate(bufferSize);
//        try {
//            VideoBufferConverter.convertFromI420(raw, buff, FourCC.RGBA);
//            Mat mat = FrameConverter.toMat(stride, length, buff.array());
//            if (buff.isDirect())
//                ClientWindow.clean(buff);

        ClientWindow.inst().processFrame(mat);
        mat.free();
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
    }

    public static Mat toMat(int width, int height, byte[] buffer) {
        int row = 0;
        int column = 0;
        System.out.println(width + "," + height + " -- " + buffer.length);
        Mat mat = new Mat((int) (height * 1.5), width, CvType.CV_32SC3);

        for (int i = 0; i < buffer.length; ) {
            int a = buffer[i++];
            int b = buffer[i++];
            int g = buffer[i++];
            int r = buffer[i++];
//            int a2 = buffer[i++];
//            int b2 = buffer[i++];
//            int g2 = buffer[i++];
//            int r2 = buffer[i++];
//            int x = buffer[i++];
//            int x1 = buffer[i++];

            if (a < 0) a = a + 255;
            if (r < 0) r = r + 255;
            if (g < 0) g = g + 255;
            if (b < 0) b = b + 255;

            int[] bgr = {r, b, g};

            mat.put(row, column++, bgr);
            if (column >= width) {
                column = 0;
                row++;
            }
        }

        return mat;


//        try {
//            BufferedImage buf = ImageIO.read(bios);
//            System.out.println("Buf Image null? " + (buf == null));
//            byte[] pixels = ((DataBufferByte) buf.getRaster().getDataBuffer()).getData();
//            Mat m = new Mat(buf.getHeight(), buf.getWidth(), CvType.CV_8UC3);
//            m.put(0, 0, pixels);
//            return m;
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        return null;
    }

    /**
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

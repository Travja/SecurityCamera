package cameraguys.project.webserver;

import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.imgcodecs.Imgcodecs;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

public class HttpStreamServer implements Runnable {


    private final String boundary = "stream";
    public Mat imag;
    private BufferedImage img = null;
    private ServerSocket serverSocket;
    private List<Socket> sockets = new ArrayList<>();
    private OutputStream outputStream;

    private boolean applicationRunning = false;

    public HttpStreamServer(Mat imagFr) {
        this.imag = imagFr;
    }

    public static BufferedImage matToImage(Mat image) throws IOException {
        MatOfByte mat = new MatOfByte();
        Imgcodecs.imencode(".jpg", image, mat);
        byte[] bytes = mat.toArray();

        InputStream in = new ByteArrayInputStream(bytes);
        BufferedImage img = ImageIO.read(in);
        mat.free();

        return img;
    }

    public void startServer() throws IOException {
        serverSocket = new ServerSocket(8080);
        applicationRunning = true;
        new Thread(() -> listenForConnections()).start();
    }

    private void listenForConnections() {
        while (applicationRunning) {
            try {
                if (!serverSocket.isClosed()) {
                    System.out.println("Awaiting socket connection....");
                    Socket socket = serverSocket.accept();
                    writeHeader(socket.getOutputStream(), boundary);
                    System.out.println("Client connected!");
                    sockets.add(socket);
                }
            } catch (IOException e) {
            }
        }
    }

    private void writeHeader(OutputStream stream, String boundary) throws IOException {
        stream.write(("HTTP/1.0 200 OK\r\n" +
                "Connection: close\r\n" +
                "Max-Age: 0\r\n" +
                "Expires: 0\r\n" +
                "Cache-Control: no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0\r\n" +
                "Pragma: no-cache\r\n" +
                "Content-Type: multipart/x-mixed-replace; " +
                "boundary=" + boundary + "\r\n" +
                "\r\n" +
                "--" + boundary + "\r\n").getBytes());
    }

    public void pushImage(Mat frame) {
        if (frame == null) return;

        List<Socket> toRemove = new ArrayList<>();
        List<Socket> tmp = new ArrayList<>(sockets); //Just clone the list to prevent ConcurrentModifications since we are multi-threaded.

        tmp.forEach(socket -> {
            try {
                outputStream = socket.getOutputStream();
                BufferedImage img = matToImage(frame);
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                ImageIO.write(img, "jpg", out); //JPG provides good compression
                byte[] imageBytes = out.toByteArray();
                outputStream.write(("Content-type: image/jpeg\r\n" +
                        "Content-Length: " + imageBytes.length + "\r\n" +
                        "\r\n").getBytes());
                outputStream.write(imageBytes);
                outputStream.write(("\r\n--" + boundary + "\r\n").getBytes());
            } catch (Exception ex) {
                toRemove.add(socket);
                System.out.println("Client disconnected.");
            }
        });
        sockets.removeAll(toRemove);
    }

    public void run() {
        try {
            startServer();
            System.out.println("Stream is active on http://localhost:8080");

            int count = 0;
            while (applicationRunning) {
                try { //For some reason you can't just have an infinite loop going at once... So the Thread.sleep keeps this alive and functional.
                    if (sockets.size() == 0)
                        Thread.sleep(10);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                if (sockets.size() > 0 && count % 1000 == 0) { //Also sort of a keep-alive, but also indicator.
                    System.out.println("Feed is currently being streamed.");
                    count = 0;
                }
                count++;
                pushImage(imag);
            }
        } catch (IOException e) {
            return;
        }
    }

    public boolean isRunning() {
        return applicationRunning;
    }

    public void stopServer() {
        applicationRunning = false;
        sockets.forEach(socket -> {
            try {
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        try {
            serverSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
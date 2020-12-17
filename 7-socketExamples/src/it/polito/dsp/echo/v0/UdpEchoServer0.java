package it.polito.dsp.echo.v0;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketAddress;
import java.util.logging.Level;
import java.util.logging.Logger;

public class UdpEchoServer0 {
	
	private static final int BUFSIZE = 65536;
	Logger logger;

	public UdpEchoServer0(int port, Logger logger) throws IOException {
		this.logger = logger;
		
		DatagramSocket socket = new DatagramSocket(port);
		logger.log(Level.INFO, "Listening to port "+port);
		DatagramPacket packet = new DatagramPacket(new byte[BUFSIZE], BUFSIZE);
		while (true) {
			socket.receive(packet);
			InetAddress remoteAddress = packet.getAddress();		
			logger.log(Level.INFO, "Received message from "+remoteAddress+ " port "+packet.getPort());
			service(socket, packet);
			packet.setLength(BUFSIZE);
		}
	}

	private void service(DatagramSocket s, DatagramPacket p) throws IOException {
		s.send(p);
	}

	public static void main(String[] args) {
		Logger logger = Logger.getLogger("it.polito.dsp.echo.UdpEchoServer0");
		if (args.length > 2) {
			logger.log(Level.SEVERE, "Wrong number of parameters");
		} else {
			int port = (args.length == 1) ? Integer.parseInt(args[0]) : 7;
			try {
				new UdpEchoServer0(port, logger);
			} catch (Exception e) {
				logger.log(Level.SEVERE, "Server error", e);
			}
		}
	}

}

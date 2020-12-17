package it.polito.dsp.echo.v0;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;

public class UdpEchoClient0 {
	private static final int BUFSIZE = 65536;
	private static final int TIMEOUT = 5000;

	public UdpEchoClient0(String server, int port) throws UnknownHostException, IOException {
		BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));
		
		DatagramSocket socket = new DatagramSocket();
		socket.setSoTimeout(TIMEOUT);
		
		String received="";
		byte buffer[]  = new byte[BUFSIZE];
		while (!received.equals("stop")) {
			System.out.print("Enter string (stop to terminate): ");
			String s = stdin.readLine();
			byte[] bytes = s.getBytes();
			InetAddress address = InetAddress.getByName(server);
			DatagramPacket toSend = new DatagramPacket(bytes,bytes.length,address,port);
			socket.send(toSend);
			DatagramPacket toReceive = new DatagramPacket(buffer, buffer.length);
			try {
				socket.receive(toReceive);
				received = new String(buffer,0,toReceive.getLength());
				System.out.println("Received: "+received);
			} catch (SocketTimeoutException e) {
				System.err.println("Response not received after "+TIMEOUT+ "ms");
			}
		}
		socket.close();
	}


	public static void main(String[] args) {
		if ((args.length < 1) || (args.length > 2))
			throw new IllegalArgumentException("Usage: java UdpEchoClient0 <Server> [<Port>]");
		String server = args[0];
		try {
			int port = (args.length == 2) ? Integer.parseInt(args[1]) : 7;
			System.out.println("server: " + server+ " Port: "+port);
			new UdpEchoClient0(server,port);
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException("Port number must be an integer");
		} catch (UnknownHostException e) {
			System.err.println("Unknown host");
		} catch (IOException e) {
			System.err.println("I/O Exception");
			e.printStackTrace();
		}
	}

}

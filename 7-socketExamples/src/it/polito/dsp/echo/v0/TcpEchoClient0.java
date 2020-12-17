package it.polito.dsp.echo.v0;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

public class TcpEchoClient0 {

	public TcpEchoClient0(String server, int port) throws UnknownHostException, IOException {
		BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));
		
		Socket socket = new Socket(server, port);
		System.out.println("Connected to server.");
		BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		PrintWriter out = new PrintWriter(socket.getOutputStream(),true);
		
		String received="";
		while (!received.equals("stop")) {
			System.out.print("Enter string (stop to terminate): ");
			String s = stdin.readLine();
			out.println(s);
			received = in.readLine();
			if (received == null) {
				System.err.println("Error: could not receive response");
				break;
			}
			System.out.println("Received: "+received);
		}
		socket.close();
	}


	public static void main(String[] args) {
		if ((args.length < 1) || (args.length > 2))
			throw new IllegalArgumentException("Usage: java TcpEchoClient0 <Server> [<Port>]");
		String server = args[0];
		try {
			int port = (args.length == 2) ? Integer.parseInt(args[1]) : 7;
			System.out.println("server: " + server+ " Port: "+port);
			new TcpEchoClient0(server,port);
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

package it.polito.dsp.echo.v0;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.logging.Level;
import java.util.logging.Logger;

public class EchoService implements Runnable {
	private static final int BUFSIZE = 32;

	Socket socket;
	Logger logger;

	public EchoService(Socket socket, Logger logger) {
		this.socket = socket;
		this.logger = logger;
	}

	@Override
	public void run() {
		try {
			service();
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Could not complete service", e);
		}
	}
	
	public void service() throws IOException {
		byte[] rBuf = new byte[BUFSIZE];
		int rsize;
		InputStream in = socket.getInputStream();
		OutputStream out = socket.getOutputStream();
		while ((rsize = in.read(rBuf)) != -1) {
			out.write(rBuf, 0, rsize);
		}
		socket.close();
	}
}

package it.polito.dsp.echo.v0;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketAddress;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TcpEchoServer3 {
	
	Logger logger;

	public TcpEchoServer3(int port, Logger logger) throws IOException {
		this.logger = logger;

		ServerSocket ss = new ServerSocket(port);
		logger.log(Level.INFO, "Listening to port "+port);
		Executor service = Executors.newCachedThreadPool();
		Socket s = null;
		while (true) {
			s = ss.accept();
			SocketAddress remoteAddress = s.getRemoteSocketAddress();		
			logger.log(Level.INFO, "Accepted connection from "+remoteAddress);
			service.execute(new EchoService(s, logger));
		}
	}


	public static void main(String[] args) {
		Logger logger = Logger.getLogger("it.polito.dsp.echo.TcpEchoServer1");
		if (args.length > 2) {
			logger.log(Level.SEVERE, "Wrong number of parameters");
		} else {
			int port = (args.length == 1) ? Integer.parseInt(args[0]) : 7;
			try {
				new TcpEchoServer3(port, logger);
			} catch (Exception e) {
				logger.log(Level.SEVERE, "Server error", e);;
			}
		}
	}

}

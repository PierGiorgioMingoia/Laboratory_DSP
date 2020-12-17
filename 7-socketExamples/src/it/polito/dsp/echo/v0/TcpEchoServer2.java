package it.polito.dsp.echo.v0;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TcpEchoServer2 {
	
	private static final int DefaultPoolSize = 4;
	Logger logger;
	int poolSize;

	public TcpEchoServer2(int port, Logger logger, int poolSize) throws IOException {
		this.logger = logger;
		this.poolSize = poolSize;
		
		ServerSocket ss = new ServerSocket(port);
		logger.log(Level.INFO, "Listening to port "+port);
		for (int i=0; i<poolSize; i++) {
			Thread thread = new Thread(new EchoServer(ss, logger));
			thread.start();
		}
	}


	public static void main(String[] args) {
		Logger logger = Logger.getLogger("it.polito.dsp.echo.TcpEchoServer2");
		if (args.length > 3) {
			logger.log(Level.SEVERE, "Wrong number of parameters");
		} else {
			int port = (args.length >= 1) ? Integer.parseInt(args[0]) : 7;
			int poolSize = (args.length == 2) ? Integer.parseInt(args[1]) : DefaultPoolSize;
			System.out.println("port: "+port+" size:"+poolSize);
			try {
				new TcpEchoServer2(port, logger, poolSize);
			} catch (Exception e) {
				logger.log(Level.SEVERE, "Server could not start", e);;
			}
		}
	}

}

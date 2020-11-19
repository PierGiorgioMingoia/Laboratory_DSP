import conversion.*;
import io.grpc.stub.StreamObserver;
import java.util.logging.Logger;

public final class Converter extends ConverterGrpc.ConverterImplBase {

	private static final Logger logger = Logger.getLogger(Converter.class.getName());
	

	@Override
	public StreamObserver<ConversionRequest> fileConvert(final StreamObserver<ConversionReply> responseObserver) {
		

	      return new StreamObserver<ConversionRequest>() {
	            @Override
	            public void onNext(ConversionRequest dataChunk) {
	            	//TODO: method to complete

	            }

	            @Override
	            public void onError(Throwable t) {
	            	//TODO: method to complete
	            }

	            @Override
	            public void onCompleted() {
	            	//TODO: method to complete         
	            }
	        };     
	}; 
};
package com.farmconnect.adminservice.client;

public class DownstreamServiceUnavailableException extends RuntimeException {
    public DownstreamServiceUnavailableException(String serviceName, Throwable cause) {
        super(serviceName + " is unavailable right now - please try again shortly", cause);
    }
}

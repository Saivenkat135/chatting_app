package com.chat.app.exceptions;

public class NoChatHistoryException extends RuntimeException {

    public NoChatHistoryException(String message) {
        super(message);
    }
}
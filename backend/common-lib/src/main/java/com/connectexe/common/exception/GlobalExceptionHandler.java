package com.connectexe.common.exception;

import com.connectexe.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(ApiException ex, HttpServletRequest request) {
        String logMessage = String.format("[%s] [%d] %s %s - %s: %s", 
            ex.getCode(),
            ex.getStatus().value(),
            request.getMethod(), 
            request.getRequestURI(),
            ex.getClass().getSimpleName(),
            ex.getMessage());
        
        if (ex.getStatus().is5xxServerError()) {
            logger.error(logMessage);
        } else {
            logger.warn(logMessage);
        }
        ErrorResponse body = new ErrorResponse(ex.getCode(), ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                         HttpServletRequest request) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        logger.warn("[VALIDATION_ERROR] [400] {} {} - {}", request.getMethod(), request.getRequestURI(), message);
        ErrorResponse body = new ErrorResponse("VALIDATION_ERROR", message, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex,
                                                          HttpServletRequest request) {
        logger.warn("[VALIDATION_ERROR] [400] {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        ErrorResponse body = new ErrorResponse("VALIDATION_ERROR", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
                                                                  HttpServletRequest request) {
        logger.warn("[METHOD_NOT_ALLOWED] [405] {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        ErrorResponse body = new ErrorResponse("METHOD_NOT_ALLOWED", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(body);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex,
                                                            HttpServletRequest request) {
        logger.warn("[MISSING_PARAMETER] [400] {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        ErrorResponse body = new ErrorResponse("MISSING_PARAMETER", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(HttpMessageNotReadableException ex,
                                                          HttpServletRequest request) {
        logger.warn("[BAD_REQUEST] [400] {} {} - Malformed request body", request.getMethod(), request.getRequestURI());
        ErrorResponse body = new ErrorResponse("BAD_REQUEST", "Malformed request body", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public ResponseEntity<Void> handleAsyncNotUsable(AsyncRequestNotUsableException ex,
                                                     HttpServletRequest request) {
        logger.debug("Async request closed {} {}", request.getMethod(), request.getRequestURI());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnknown(Exception ex, HttpServletRequest request) {
        logger.error("[INTERNAL_ERROR] [500] {} {} - {}: {}", 
            request.getMethod(), 
            request.getRequestURI(), 
            ex.getClass().getSimpleName(),
            ex.getMessage());
        ErrorResponse body = new ErrorResponse("INTERNAL_ERROR", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

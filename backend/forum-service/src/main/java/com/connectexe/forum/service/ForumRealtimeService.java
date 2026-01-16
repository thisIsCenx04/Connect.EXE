package com.connectexe.forum.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ForumRealtimeService {

    private static final long STREAM_TIMEOUT_MS = Duration.ofMinutes(30).toMillis();

    private final ConcurrentHashMap<UUID, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID postId) {
        SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT_MS);
        emitters.computeIfAbsent(postId, id -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> removeEmitter(postId, emitter));
        emitter.onTimeout(() -> removeEmitter(postId, emitter));
        emitter.onError(ex -> removeEmitter(postId, emitter));
        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException ex) {
            removeEmitter(postId, emitter);
        }
        return emitter;
    }

    public void publish(UUID postId, String eventName, Object payload) {
        List<SseEmitter> listeners = emitters.get(postId);
        if (listeners == null || listeners.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : listeners) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (IOException ex) {
                removeEmitter(postId, emitter);
            }
        }
    }

    private void removeEmitter(UUID postId, SseEmitter emitter) {
        List<SseEmitter> listeners = emitters.get(postId);
        if (listeners == null) {
            return;
        }
        listeners.remove(emitter);
        if (listeners.isEmpty()) {
            emitters.remove(postId);
        }
    }
}

package com.connectexe.project.dto;

public record ProjectMatchResponse(
    ProjectResponse project,
    int score
) {}

package com.connectexe.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProjectEvaluateRequest {
    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Project name is too long")
    private String projectName;

    @NotBlank(message = "Summary is required")
    @Size(max = 2000, message = "Summary is too long")
    private String summary;

    @Size(max = 120, message = "Stage is too long")
    private String stage;

    @Size(max = 1000, message = "Metrics is too long")
    private String metrics;

    @Size(max = 600, message = "Funding need is too long")
    private String fundingNeed;

    @Size(max = 800, message = "Team is too long")
    private String team;

    @Size(max = 800, message = "Risks is too long")
    private String risks;

    @Size(max = 800, message = "Strengths is too long")
    private String strengths;

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getMetrics() {
        return metrics;
    }

    public void setMetrics(String metrics) {
        this.metrics = metrics;
    }

    public String getFundingNeed() {
        return fundingNeed;
    }

    public void setFundingNeed(String fundingNeed) {
        this.fundingNeed = fundingNeed;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getRisks() {
        return risks;
    }

    public void setRisks(String risks) {
        this.risks = risks;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }
}

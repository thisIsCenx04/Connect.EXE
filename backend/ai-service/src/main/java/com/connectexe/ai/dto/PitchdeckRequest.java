package com.connectexe.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PitchdeckRequest {
    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Project name is too long")
    private String projectName;

    @NotBlank(message = "Problem statement is required")
    @Size(max = 2000, message = "Problem statement is too long")
    private String problem;

    @NotBlank(message = "Solution is required")
    @Size(max = 2000, message = "Solution is too long")
    private String solution;

    @Size(max = 1000, message = "Market is too long")
    private String market;

    @Size(max = 1000, message = "Business model is too long")
    private String businessModel;

    @Size(max = 1000, message = "Traction is too long")
    private String traction;

    @Size(max = 800, message = "Team is too long")
    private String team;

    @Size(max = 500, message = "Ask is too long")
    private String ask;

    @Size(max = 500, message = "Notes is too long")
    private String notes;

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }

    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public String getBusinessModel() {
        return businessModel;
    }

    public void setBusinessModel(String businessModel) {
        this.businessModel = businessModel;
    }

    public String getTraction() {
        return traction;
    }

    public void setTraction(String traction) {
        this.traction = traction;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getAsk() {
        return ask;
    }

    public void setAsk(String ask) {
        this.ask = ask;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

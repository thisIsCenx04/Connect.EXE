package com.connectexe.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MarketAnalyzeRequest {
    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Project name is too long")
    private String projectName;

    @Size(max = 120, message = "Industry is too long")
    private String industry;

    @Size(max = 120, message = "Region is too long")
    private String region;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description is too long")
    private String description;

    @Size(max = 400, message = "Target customer is too long")
    private String targetCustomer;

    @Size(max = 400, message = "Competitors is too long")
    private String competitors;

    @Size(max = 400, message = "Differentiator is too long")
    private String differentiator;

    @Size(max = 400, message = "Goals is too long")
    private String goals;

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTargetCustomer() {
        return targetCustomer;
    }

    public void setTargetCustomer(String targetCustomer) {
        this.targetCustomer = targetCustomer;
    }

    public String getCompetitors() {
        return competitors;
    }

    public void setCompetitors(String competitors) {
        this.competitors = competitors;
    }

    public String getDifferentiator() {
        return differentiator;
    }

    public void setDifferentiator(String differentiator) {
        this.differentiator = differentiator;
    }

    public String getGoals() {
        return goals;
    }

    public void setGoals(String goals) {
        this.goals = goals;
    }
}

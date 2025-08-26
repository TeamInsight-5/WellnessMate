package com.example.ai_project.main.dto;

import java.util.List;

public class SurveyData {
    private List<String> symptoms;
    private String duration;
    private String severity;
    private List<String> history;

    // Getters and Setters
    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public List<String> getHistory() { return history; }
    public void setHistory(List<String> history) { this.history = history; }
}
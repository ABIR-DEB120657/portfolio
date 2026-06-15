package com.abir.portfolio.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Project {

    private String title;
    private String category;
    private String description;
    private List<String> tags;
    private boolean featured;
    private String githubUrl;
    private String liveUrl;

    // Getters & Setters
    public String getTitle()                   { return title; }
    public void setTitle(String title)         { this.title = title; }

    public String getCategory()                { return category; }
    public void setCategory(String category)   { this.category = category; }

    public String getDescription()             { return description; }
    public void setDescription(String desc)    { this.description = desc; }

    public List<String> getTags()              { return tags; }
    public void setTags(List<String> tags)     { this.tags = tags; }

    public boolean isFeatured()                { return featured; }
    public void setFeatured(boolean featured)  { this.featured = featured; }

    public String getGithubUrl()               { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLiveUrl()                 { return liveUrl; }
    public void setLiveUrl(String liveUrl)     { this.liveUrl = liveUrl; }
}
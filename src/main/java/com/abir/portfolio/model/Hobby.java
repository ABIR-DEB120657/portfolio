package com.abir.portfolio.model;

@SuppressWarnings("unused")
public class Hobby {
    private String name;
    private String icon;
    private String description;
    private String emoji;

    public Hobby() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
}
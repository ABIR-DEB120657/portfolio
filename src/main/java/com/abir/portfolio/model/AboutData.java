package com.abir.portfolio.model;

import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
public class AboutData {

    private String name;
    private String tagline;
    private String whoIAm;
    private String whatIDo;
    private Map<String, String> quickInfo;
    private List<Education> education;
    private List<Hobby> hobbies;     // ← Updated: String থেকে Hobby object

    public AboutData() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getWhoIAm() { return whoIAm; }
    public void setWhoIAm(String whoIAm) { this.whoIAm = whoIAm; }

    public String getWhatIDo() { return whatIDo; }
    public void setWhatIDo(String whatIDo) { this.whatIDo = whatIDo; }

    public Map<String, String> getQuickInfo() { return quickInfo; }
    public void setQuickInfo(Map<String, String> quickInfo) { this.quickInfo = quickInfo; }

    public List<Education> getEducation() { return education; }
    public void setEducation(List<Education> education) { this.education = education; }

    public List<Hobby> getHobbies() { return hobbies; }
    public void setHobbies(List<Hobby> hobbies) { this.hobbies = hobbies; }
}
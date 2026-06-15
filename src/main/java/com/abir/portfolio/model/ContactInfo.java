package com.abir.portfolio.model;

public class ContactInfo {

    private String email;
    private String location;
    private String github;
    private String linkedin;
    private String instagram;

    public String getEmail()     { return email;     }
    public String getLocation()  { return location;  }
    public String getGithub()    { return github;    }
    public String getLinkedin()  { return linkedin;  }
    public String getInstagram() { return instagram; }

    public void setEmail(String email)          { this.email     = email;     }
    public void setLocation(String location)    { this.location  = location;  }
    public void setGithub(String github)        { this.github    = github;    }
    public void setLinkedin(String linkedin)    { this.linkedin  = linkedin;  }
    public void setInstagram(String instagram)  { this.instagram = instagram; }
}
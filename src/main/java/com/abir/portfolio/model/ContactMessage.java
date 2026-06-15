package com.abir.portfolio.model;

import java.time.LocalDateTime;
@SuppressWarnings("unused")
public class ContactMessage {

    private Long id;
    private String senderName;
    private String senderEmail;
    private String subject;
    private String message;
    private LocalDateTime sentAt;

    // ডিফল্ট কন্সট্রাক্টর
    public ContactMessage() {
        // অবজেক্ট তৈরি হওয়ার সাথে সাথেই যেন বর্তমান সময় সেট হয়ে যায়
        this.sentAt = LocalDateTime.now();
    }

    public ContactMessage(String senderName, String senderEmail, String subject, String message) {
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.subject = subject;
        this.message = message;
        this.sentAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}
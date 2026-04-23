package com.example.demo.dto;

import com.example.demo.model.Ticket;
import com.example.demo.model.enums.TicketCategory;
import com.example.demo.model.enums.TicketPriorityType;
import com.example.demo.model.enums.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private String tid;
    private String description;
    private String contactDetails;
    private TicketCategory category;
    private TicketPriorityType priority;
    private TicketStatus status;
    
    private String raisedByUserId;
    private String assignedToTechnicianId;
    private String resourceId;

    private Instant createdAt;
    private Instant updatedAt;

    public static TicketResponse fromEntity(Ticket ticket) {
        return TicketResponse.builder()
                .tid(ticket.getTid())
                .description(ticket.getDescription())
                .contactDetails(ticket.getContactDetails())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .raisedByUserId(ticket.getRaisedByUserId())
                .assignedToTechnicianId(ticket.getAssignedToTechnicianId())
                .resourceId(ticket.getResourceId())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
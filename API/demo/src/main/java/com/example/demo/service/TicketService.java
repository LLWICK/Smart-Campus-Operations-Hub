package com.example.demo.service;

import com.example.demo.dto.TicketRequest;
import com.example.demo.dto.TicketResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Ticket;
import com.example.demo.model.User;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketResponse createTicket(TicketRequest request) {
        Ticket ticket = Ticket.builder()
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .contactDetails(request.getContactDetails())
                .raisedByUserId(request.getRaisedByUserId())
                .resourceId(request.getResourceId())
                .status(TicketStatus.OPEN) // Default status
                .build();

        return TicketResponse.fromEntity(ticketRepository.save(ticket));
    }

    public List<TicketResponse> getAllTickets(User currentUser) {
        if (isAdminOrTech(currentUser)) {
            return ticketRepository.findAll().stream().map(TicketResponse::fromEntity).toList();
        }
        return ticketRepository.findByRaisedByUserId(currentUser.getId()).stream()
                .map(TicketResponse::fromEntity).toList();
    }

    public List<TicketResponse> getTicketsByUserId(String targetUserId, User currentUser) {
    // Security: Only Admins/Techs can view anyone's tickets. 
    // Regular users can only request their own ID.
    if (!isAdminOrTech(currentUser) && !currentUser.getId().equals(targetUserId)) {
        throw new AccessDeniedException("You do not have permission to view these tickets.");
    }

    return ticketRepository.findByRaisedByUserId(targetUserId)
            .stream()
            .map(TicketResponse::fromEntity)
            .toList();
}


    public TicketResponse getTicketById(String id, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        
        assertTicketAccess(ticket, currentUser);
        return TicketResponse.fromEntity(ticket);
    }

    public TicketResponse updateTicketStatus(String id, TicketStatus status, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        
        // Only Admins or assigned Technicians should usually move status
        ticket.setStatus(status);
        return TicketResponse.fromEntity(ticketRepository.save(ticket));
    }


    public TicketResponse assignToTechnician(String id, String technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        
        ticket.setAssignedToTechnicianId(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        return TicketResponse.fromEntity(ticketRepository.save(ticket));
    }

    private boolean isAdminOrTech(User user) {
        String role = user.getRole().toLowerCase();
        return role.equals("admin") || role.equals("technician");
    }

    private void assertTicketAccess(Ticket ticket, User user) {
        if (isAdminOrTech(user) || ticket.getRaisedByUserId().equals(user.getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this ticket");
    }

    public TicketResponse updateAdminResponse(String id, String response) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        ticket.setAdminResponse(response);
        return TicketResponse.fromEntity(ticketRepository.save(ticket));
    }

    public TicketResponse updateTechnicianFeedback(String id, String feedback, User user) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        // Security check: Only the assigned tech (or admin) can update feedback
        if (!user.getRole().equals("ADMIN") && !ticket.getAssignedToTechnicianId().equals(user.getId())) {
            throw new AccessDeniedException("You are not assigned to this ticket.");
        }

        ticket.setTechnicianFeedback(feedback);
        
        // Auto-update status to RESOLVED if feedback is provided
        if (ticket.getStatus() == TicketStatus.IN_PROGRESS || ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.RESOLVED);
        }

        return TicketResponse.fromEntity(ticketRepository.save(ticket));
}

    public List<TicketResponse> getTicketsByTechnician(String technicianId) {
        return ticketRepository.findByAssignedToTechnicianId(technicianId)
                .stream()
                .map(TicketResponse::fromEntity)
                .toList();
    }

    
}
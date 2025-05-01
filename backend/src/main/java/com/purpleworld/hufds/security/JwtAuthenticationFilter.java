package com.purpleworld.hufds.security;

import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final CourierRepository courierRepository;
    private final RestaurantRepository restaurantRepository;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   CustomerRepository customerRepository,
                                   CourierRepository courierRepository,
                                   RestaurantRepository restaurantRepository) {
        this.jwtService = jwtService;
        this.customerRepository = customerRepository;
        this.courierRepository = courierRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        // Add logging to debug the issue
        System.out.println("Request URL: " + request.getRequestURI());
        System.out.println("Auth Header: " + (authHeader != null ? "Present" : "Not Present"));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        String username;
        String role;

        try {
            username = jwtService.extractUsername(jwt);
            role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
            
            // Add debugging logs
            System.out.println("Extracted username: " + username);
            System.out.println("Extracted role: " + role);
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired: " + e.getMessage());
            sendErrorResponse(response, "Token has expired");
            return;
        } catch (Exception e) {
            System.out.println("Token validation error: " + e.getMessage());
            sendErrorResponse(response, "Invalid token");
            return;
        }

        // Check user status
        boolean isValid = isAccountValid(username, role);
        System.out.println("Account validation result: " + isValid);
        
        if (!isValid) {
            sendErrorResponse(response, "Account is not approved or has been banned/rejected");
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, null, List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            SecurityContextHolder.getContext().setAuthentication(authToken);
            System.out.println("Authentication set in SecurityContext");
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAccountValid(String email, String role) {
        // Use a more permissive validation during development/debugging
        // For CUSTOMER, just check if they exist and are not banned
        if ("CUSTOMER".equals(role)) {
            return customerRepository.findByEmail(email)
                    .map(c -> !c.isBanned())
                    .orElse(false); // This might be the issue - if customer not found, returns false
        } 
        else if ("COURIER".equals(role)) {
            return courierRepository.findByEmail(email)
                    .map(c -> c.getStatus() == AccountStatus.APPROVED)
                    .orElse(false);
        } 
        else if ("RESTAURANT".equals(role)) {
            return restaurantRepository.findByEmail(email)
                    .map(r -> r.getStatus() == AccountStatus.APPROVED)
                    .orElse(false);
        }
        // For ADMIN or unknown roles, return true
        return true;
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
        response.getWriter().flush();
    }
}
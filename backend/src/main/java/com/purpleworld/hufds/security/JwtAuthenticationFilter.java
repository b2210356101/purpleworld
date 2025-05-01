package com.purpleworld.hufds.security;

import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.security.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
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

// ai-gen(gpt-4,1)
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
        } catch (ExpiredJwtException e) {
            sendErrorResponse(response, "Token has expired");
            return;
        } catch (Exception e) {
            sendErrorResponse(response, "Invalid token");
            return;
        }

        // Check user status
        if (!isAccountValid(username, role)) {
            sendErrorResponse(response, "Account is not approved or has been banned/rejected");
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, null, List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAccountValid(String email, String role) {
        return switch (role) {
            case "CUSTOMER" -> customerRepository.findByEmail(email).map(c -> !c.isBanned()).orElse(false);
            case "COURIER" ->
                    courierRepository.findByEmail(email).map(c -> c.getStatus() == AccountStatus.APPROVED).orElse(false);
            case "RESTAURANT" ->
                    restaurantRepository.findByEmail(email).map(r -> r.getStatus() == AccountStatus.APPROVED).orElse(false);
            default -> true;
        };
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
        response.getWriter().flush();
    }
}
// ai-gen(gpt-4,1)
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Divider, CircularProgress } from "@mui/material";
import { getAdminStats } from "../utils/api"; // Yeni API fonksiyonu
import { AdminStats } from "../types";
import { useNavigate } from "react-router-dom"; // Tip tanımı burada
import Loading from "../components/Loading";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<AdminStats>({
        totalRestaurants: 0,
        totalCouriers: 0,
        totalPendingApprovals: 0,
        totalCoupons: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getAdminStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome, Admin!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Manage users, restaurants, couriers, and platform settings from here.
            </Typography>

            <Divider sx={{ my: 4 }} />

            {loading ? <Loading /> : (
                <Grid
                    container
                    spacing={3}
                    justifyContent="center"
                    alignItems="stretch"
                    sx={{ maxWidth: 1000, mx: 'auto' }}
                >
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper onClick={() => navigate("/admin/restaurants")}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                borderRadius: 3,
                                cursor: "pointer",
                                transition: "0.3s ease",
                                "&:hover": {
                                    boxShadow: 6,
                                    transform: "scale(1.03)",
                                    backgroundColor: "primary.light"
                                }
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                {stats.totalRestaurants}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Restaurants
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper onClick={() => navigate("/admin/couriers")}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                borderRadius: 3,
                                cursor: "pointer",
                                transition: "0.3s ease",
                                "&:hover": {
                                    boxShadow: 6,
                                    transform: "scale(1.03)",
                                    backgroundColor: "primary.light"
                                }
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                {stats.totalCouriers}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Couriers
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h4" fontWeight="bold" color={stats.totalPendingApprovals > 0 ? 'warning.main' : 'primary'}>
                                {stats.totalPendingApprovals}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Pending Approvals
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h4" fontWeight="bold" color={stats.totalCoupons > 0 ? 'success.main' : 'primary'}>
                                {stats.totalCoupons}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Active Coupons
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default AdminDashboard;
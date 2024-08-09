import * as React from "react";
import { useEffect } from "react";
import { Autocomplete } from "@mui/material";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Validation from "./LoginValidation";
import {
  getCountry,
  retrieveAccountDetailsWithEmail,
  getBannedCountries,
} from "../../Api";

const defaultTheme = createTheme();

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [coordinates, setCoordinates] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [bannedCountries, setBannedCountries] = React.useState([
    "Cuba",
    `Iran`,
    ` North Korea`,
    ` Russia`,
    `Syria`,
    `Ukraine`,
    `Italy`,
  ]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          confirm("Please enable geolocation to use this application.");
        }
      );
    } else {
      confirm("Please enable geolocation to use this application.");
    }

    const getBannedCountries = async () => {
      try {
        let banList = await fetch("http://localhost:8000/api/countries/banned");
        let list = await banList.json();
        let bannedCountryNames = list.map((c) => c.CountryName);
        //console.log(bannedCountryNames);
        setBannedCountries(bannedCountryNames);
        return list;
      } catch (err) {
        console.log(err);
        return [];
      }
    };
    getBannedCountries();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!coordinates) {
      confirm("Please enable geolocation to use this application.");
      return;
    }

    const validationErrors = Validation(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/login", {
        email: formData.email,
        password: formData.password,
      });

      let accountData = await retrieveAccountDetailsWithEmail(formData.email);
      let LoginCoords = JSON.stringify(coordinates);
      let lastIPLogin = await getCountry(coordinates);
      // If login from banned country, mark account as scammed;
      if (bannedCountries.includes(lastIPLogin)) {
        let result = await fetch(
          `http://localhost:8000/api/accounts/${accountData.AccountNo}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              AccountStatus: 1,
              Scammer: 1,
            }),
          }
        );
        accountData.Scammed = true;
      }
      //console.log("LAST IP Login",lastIPLogin);
      let currentDateTime = new Date();
      const accountLogData = {
        AccountNo: accountData.AccountNo,
        LoginCoords: LoginCoords,
        LastIPLoginCountry: lastIPLogin,
        Flagged: accountData.Scammed ? true : false,
        LoginTime: JSON.stringify(currentDateTime),
      };

      const addAccountLog = await fetch(
        "http://localhost:8000/api/accounts/log",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(accountLogData),
        }
      );

      let res = await addAccountLog.json();

      if (response.status === 200) {
        if (formData.email === "DELETED@gmail.com") {
          navigate("/adminDashboard");
        } else {
          navigate("/features"); // Replace with your desired route
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrors({ general: "Email address and Password does not match" });
      } else {
        console.error("Login error:", error.message);
        setErrors({ general: "An error occurred. Please try again." });
      }
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <RouterLink to="/home">
            <img
              src="/elderwee-logo/svg/logo-no-background.svg"
              alt="logo"
              style={{ width: "80px", height: "40px" }}
            />
          </RouterLink>
          <Typography component="h1" variant="h5">
            Log in
          </Typography>
          {location.state && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="success.main">
                {location.state.message}
              </Typography>
            </Box>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            {errors.general && (
              <Typography color="error" variant="body2">
                {errors.general}
              </Typography>
            )}
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Log In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/forgot" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

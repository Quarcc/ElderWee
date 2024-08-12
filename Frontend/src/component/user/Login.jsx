import * as React from "react";
import { useEffect,useRef } from "react";
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
import { retrieveAccountDetailsWithEmail } from "../../Api";

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
  const [webcam, setWebcam] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          confirm("Please enable geolocation to use this application.");
        }
      );
    } else {
      confirm("Please enable geolocation to use this application.");
    }
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
      // Perform login request
      const response = await axios.post(
        "http://localhost:8000/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      // Retrieve account details
      let accountData = await retrieveAccountDetailsWithEmail(formData.email);

      // Create account log
      //let LoginCoords = JSON.stringify(coordinates);
      let coordsString = `${coordinates.latitude}, ${coordinates.longitude}`;
      let localDate = new Date()
      let currentDateTime = new Date( localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();
      
      const accountLogData = {
        AccountNo: accountData.AccountNo,
        LoginCoords: coordsString,
        LastIPLoginCountry: "Singapore",
        Flagged: accountData.Scammed ? true : false,
        // LoginTime: currentDateTime,
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

      let logRes = await addAccountLog.json();

      // Proceed with login if the account log creation is successful
      if (response.status === 200) {
        if (formData.email === "DELETED@gmail.com") {
          navigate("/adminDashboard");
        } else {
          navigate("/home"); // Replace with your desired route
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

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      setWebcam(true);
    } catch (err) {
      console.error("Error accessing webcam: ", err);
      alert("No webcam detected.");
    }
  };

  const handleCapture = async () => {
    console.log("CAPTURE");
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    let compareResult = null;
    await canvasRef.current.toBlob(async (blob) => {
      compareResult = await fetch(`http://localhost:8000/user/compare-faces`, {
        method: "POST",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: blob,
      });

      let message = await compareResult.json();
      console.log(message);
      if (compareResult.ok) {
        let email = message.email.replace(".jpeg", "");
        const authenticateFace = await axios.post(
        "http://localhost:8000/authenticate-face-login",
        {
          email: email,
        },
        { withCredentials: true }
      );
        console.log(email);
        try {
            let accountData = await retrieveAccountDetailsWithEmail(
              email
            );
            let LoginCoords = JSON.stringify(coordinates);
            let currentDateTime = new Date();
            const accountLogData = {
              AccountNo: accountData.AccountNo,
              LoginCoords: LoginCoords,
              LastIPLoginCountry: "Singapore",
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

          console.log(res);

          //to-do Replace conditional statement with (response.status === 200) when connected to DB
          if (addAccountLog.status === 200) {
            if (email === "DELETED@gmail.com") {
              navigate("/adminDashboard");
            } else {
              navigate("/home"); // Replace with your desired route
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
      }
    }, "image/jpeg");
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
            gap: 2, // Added gap between elements for better spacing
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
            sx={{ mt: 1, width: "100%" }}
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

          {/* OR Divider */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              mt: 3,
              mb: 3,
            }}
          >
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "gray" }} />
            <Typography sx={{ mx: 2, color: "gray" }}>OR</Typography>
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "gray" }} />
          </Box>

          {/* FaceID Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 2, // Margin top to separate from form
              padding: 3,
              borderRadius: 2,
              backgroundColor: "background.paper",
              boxShadow: 3,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-64 h-auto rounded-lg border-2 border-gray-300 mb-4"
            />
            <Button
              onClick={startVideo}
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mb: 2 }}
            >
              Login with FaceID
            </Button>
            {webcam && (
              <Button
                onClick={handleCapture}
                fullWidth
                variant="contained"
                color="primary"
              >
                Scan
              </Button>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          </Box>

          {capturedImage && (
            <Box sx={{ mt: 4 }}>
              <img
                src={capturedImage}
                alt="Captured"
                className="w-64 h-auto rounded-lg border-2 border-gray-300"
              />
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );

}

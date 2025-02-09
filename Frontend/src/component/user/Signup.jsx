import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Validation from "./SignUpValidation";

const defaultTheme = createTheme();

export default function SignUp() {
  const navigate = useNavigate();
  const [errors, setErrors] = React.useState({});
  const [capturedImage, setCapturedImage] = React.useState(null);
  const [capturedImageFile, setCapturedImageFile] = React.useState(null);
  const [webcam, setWebcam] = React.useState(false);
  const videoRef = React.useRef();
  const canvasRef = React.useRef();

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/check-unique-email",
        { email }
      );
      return response.data.exists; // assuming the server returns { exists: true/false }
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userData = {
      fullName: data.get("fullName"),
      dob: data.get("dob"),
      email: data.get("email"),
      phoneNo: data.get("phoneNo"),
      password: data.get("password"),
    };
    const password2 = data.get("password2");

    const validationErrors = Validation({ ...userData, password2 });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Email is already registered.",
      }));
      return;
    }

    try {
      if (capturedImageFile) {
        const facialImageUpload = await fetch(
          `http://localhost:8000/user/upload-photo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "image/jpeg",
              Email: data.get("email"),
            },
            body: capturedImageFile,
          }
        );
        const facialUploadRes = await facialImageUpload.json();
        console.log(facialUploadRes);
      }

      const response = await axios.post(
        "http://localhost:8000/signup",
        userData
      );
      console.log("User signed up successfully:", response.data);
      navigate("/Login", {
        state: {
          message:
            "Your account has been signed up, please log in with the credentials.",
        },
      });
    } catch (error) {
      console.error("There was an error signing up:", error);
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
    canvasRef.current.toBlob((blob) => {
      setCapturedImageFile(blob);
    }, "image/jpeg");

    // const capturedImageURL = canvasRef.current.toDataURL("image/jpeg");
    // setCapturedImage(capturedImageURL);
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
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="name"
                  name="fullName"
                  required
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  autoFocus
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="dob"
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.dob}
                  helperText={errors.dob}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="phoneNo"
                  label="Phone Number"
                  id="phoneNo"
                  error={!!errors.phoneNo}
                  helperText={errors.phoneNo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password2"
                  label="Confirm Password"
                  type="password"
                  id="password2"
                  autoComplete="new-password"
                  error={!!errors.password2}
                  helperText={errors.password2}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/Login" variant="body2">
                  Already have an account? Log in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        {/* FaceID Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
            padding: 3,
            borderRadius: 2,
            backgroundColor: "background.paper",
            boxShadow: 3,
            width: "100%", // Ensure the box fits well within the container
          }}
        >
          <Box
            sx={{
              position: "relative",
              paddingBottom: "56.25%",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                objectFit: "cover", // Maintain aspect ratio
              }}
              className="border-2 border-gray-300"
            />
          </Box>

          <Button
            onClick={startVideo}
            variant="contained"
            color="primary"
            sx={{
              mb: 2,
              width: "100%",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Add FaceID
          </Button>
          {webcam && (
            <Button
              onClick={handleCapture}
              variant="contained"
              color="secondary"
              sx={{
                width: "100%",
                backgroundColor: "#00c853",
                "&:hover": {
                  backgroundColor: "#00b34a",
                },
              }}
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
      </Container>
    </ThemeProvider>
  );
}

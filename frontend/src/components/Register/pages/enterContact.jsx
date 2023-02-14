import { Box, FormControl, FormLabel, TextField } from "@mui/material";
import { useEffect } from "react";
import { maxLengthCheck } from "../../Modules/maxLengthCheck";
import styles from "../Register.module.css";

export default function EnterContact(props) {
  const {
    phone,
    setPhone,
    email,
    setEmail,
    FormLabelStyle,
    FormControlFlex,
    setCGN,
  } = props.data;

  useEffect(() => {
    if (!email && !phone) {
      setCGN(false);
    } else {
      setCGN(true);
    }
  }, [email, phone]);

  return (
    <>
      <h2 className={styles.description}>{props.description}</h2>
      <Box className={styles.RegisterForm}>
        <FormControl sx={FormControlFlex}>
          <FormLabel sx={FormLabelStyle}>전화번호</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            placeholder="예) 01012345678"
            sx={{ width: "12rem" }}
            margin="normal"
            type="number"
            name="phone"
            onChange={(e) => {
              setPhone(e.target.value);
              maxLengthCheck(e, null, 11);
            }}
            defaultValue={phone}
          />
        </FormControl>
        <FormControl sx={FormControlFlex}>
          <FormLabel sx={FormLabelStyle}>이메일</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            placeholder="예) example@email.com"
            sx={{ width: "12rem" }}
            margin="normal"
            type="email"
            name="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            defaultValue={email}
            required
          />
        </FormControl>
      </Box>
    </>
  );
}

import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import styles from "../Register.module.css";

export default function EnterUserInfo(props) {
  const { username, setUsername, gender, setGender, FormControlFlex, FormLabelStyle, setCGN } =
    props.data;

  useEffect(() => {
    if (!username || !gender) {
      setCGN(false);
    } else {
      setCGN(true);
    }
  }, [username, gender]);

  return (
    <>
      <h2 className={styles.description}>{props.description}</h2>
      <Box className={styles.RegisterForm}>
        <FormControl sx={FormControlFlex}>
          <FormLabel sx={FormLabelStyle}>이름*</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            placeholder="예) 홍길동"
            sx={{ width: "12rem" }}
            margin="normal"
            type="text"
            name="username"
            required
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            defaultValue={username}
          />
        </FormControl>
        <FormControl sx={FormControlFlex}>
          <FormLabel focused={false} sx={FormLabelStyle}>
            성별*
          </FormLabel>
          <RadioGroup
            row
            sx={{ justifyContent: "space-evenly", width: "12rem" }}
            value={gender ? gender : null}
          >
            <FormControlLabel
              value="m"
              control={<Radio required />}
              label="남"
              labelPlacement="bottom"
              onChange={(e) => {
                setGender(e.target.value);
              }}
            />
            <FormControlLabel
              value="f"
              control={<Radio required />}
              label="여"
              labelPlacement="bottom"
              onChange={(e) => {
                setGender(e.target.value);
              }}
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </>
  );
}

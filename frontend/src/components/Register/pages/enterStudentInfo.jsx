import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { maxLengthCheck } from "../../Modules/maxLengthCheck";
import styles from "../Register.module.css";

export default function EnterStudentInfo(props) {
  const {
    Grade,
    setGrade,
    Class,
    setClass,
    studentID,
    setSID,
    FormControlFlex,
    FormLabelStyle,
    setCGN,
  } = props.data;

  useEffect(() => {
    if (!Grade || !Class || !studentID) {
      setCGN(false);
    } else {
      setCGN(true);
    }
  }, [Grade, Class, studentID]);

  return (
    <>
      <h2 className={styles.description}>{props.description}</h2>
      <Box className={styles.RegisterForm}>
        <FormControl sx={FormControlFlex}>
          <FormLabel sx={FormLabelStyle}>학년*</FormLabel>
          <Select
            value={Grade ? Grade : ""}
            required
            sx={{ width: "4rem" }}
            onChange={(e) => {
              setGrade(e.target.value);
            }}
          >
            <MenuItem value="" disabled>
              학년 선택
            </MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={FormControlFlex}>
          <FormLabel sx={FormLabelStyle}>반*</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            placeholder="반"
            type="number"
            required
            sx={{ width: "4rem" }}
            onChange={(e) => {
              maxLengthCheck(e, null, 2);
              setClass(e.target.value);
            }}
            defaultValue={Class}
          />
        </FormControl>
        <FormControl sx={FormControlFlex}>
          <FormLabel sx={FormLabelStyle}>번호*</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            placeholder="번호"
            type="number"
            required
            sx={{ width: "4rem" }}
            onChange={(e) => {
              maxLengthCheck(e, null, 2);
              setSID(e.target.value);
            }}
            defaultValue={studentID}
          />
        </FormControl>
      </Box>
    </>
  );
}

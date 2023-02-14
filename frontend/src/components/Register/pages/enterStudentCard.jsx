import { Add, Delete } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useEffect } from "react";
import ReactImageUploading from "react-images-uploading";
import settings from "../../../settings";
import styles from "../Register.module.css";

export default function EnterStudentCard(props) {
  const { StudentCard, setSC, FormControlFlex, FormLabelStyle, setCGN } =
    props.data;

  const onImageChange = (image) => {
    setSC(image);
  };

  useEffect(() => {
    if (StudentCard) {
      setCGN(true);
    } else {
      setCGN(false);
    }
  }, [StudentCard]);

  return (
    <>
      <h2 className={styles.description}>{props.description}</h2>
      <span className={styles.description} style={{ color: "#d32f2f" }}>
        학생증 카드는 재학생 인증 용도로만 사용되며 인증 완료 후 안전하게
        삭제됩니다.
      </span>
      <Box className={styles.RegisterForm} style={{ gap: "12px" }}>
        <ReactImageUploading
          multiple={false}
          value={StudentCard}
          onChange={onImageChange}
          maxNumber={2}
          dataURLKey="img_url"
          acceptType={["jpg", "jpeg", "png"]}
          maxFileSize={settings.maxImageSize}
        >
          {({
            imageList,
            onImageUpload,
            onImageRemoveAll,
            onImageUpdate,
            onImageRemove,
            errors,
          }) => (
            <>
              <br />
              <span>
                학생증 카드 업로드
                <IconButton
                  onClick={() => {
                    if (StudentCard?.length > 1) {
                      onImageUpload();
                      setSC([...StudentCard[1]]);
                    } else {
                      onImageUpload();
                    }
                  }}
                >
                  <Add />
                </IconButton>
              </span>
              <small>이름과 생년월일이 포함된 앞면을 업로드해주세요.</small>
              {errors && (
                <div className={styles.error_wrapper}>
                  {errors.maxNumber && (
                    <span>이미지는 1장만 업로드할 수 있습니다.</span>
                  )}
                  {errors.acceptType && (
                    <span>지원되지 않는 파일 형식입니다</span>
                  )}
                  {errors.maxFileSize && (
                    <span>
                      파일 크키가 너무 큽니다. (최대{" "}
                      {settings.maxImageSize / 1000000}MB)
                    </span>
                  )}
                </div>
              )}
              {imageList.map((image, index) => (
                <div className={styles.sc_wrapper} key={index}>
                  <img src={image["img_url"]} alt="" className={styles.sc} />
                  <span>
                    {image["file"].name}
                    <IconButton onClick={() => onImageRemove(index)}>
                      <Delete />
                    </IconButton>
                  </span>
                </div>
              ))}
            </>
          )}
        </ReactImageUploading>
      </Box>
    </>
  );
}

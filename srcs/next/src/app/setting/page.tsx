'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import sendRequest from '../api';
import { useRouter } from 'next/navigation';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import store, { RootState } from '../redux/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { myAlert } from '../home/alert';
import { setName, setUserImg } from '../redux/userSlice';
import { styled } from '@mui/material/styles';
import { maxUniqueNameLength } from '../globals';
import { isValid } from '../home/valid';
import { removeCookie } from '@/app/Cookie';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ButtonGroup, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const SettingInfo = () => {
  const [userName, setUserName] = useState<string>('');
  const [require2fa, setRequire2fa] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>('');
  const [inputImg, setInputImg] = useState<string | null>(null);
  const userImg = useSelector((state: RootState) => state.user.userImg);
  const dispatch = useDispatch();
  const myName = useSelector((state: RootState) => state.user.userName);
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
  const router = useRouter();

  useEffect(() => {
    if (mySlackId) {
      getUserInfo();
      getUserProfileImg();
    } else {
      router.push('/home');
    }
  }, []);

  const getUserInfo = async () => {
    const response = await sendRequest('get', '/users/userInfo/', router);
    setUserName(response.data.userName);
    setRequire2fa(response.data.require2fa);
  };

  const getUserProfileImg = async () => {
    const response = await sendRequest(
      'get',
      `users/profileImg/${mySlackId}`,
      router,
    );
    const imageBlob = new Blob([response.data.profileImage], {
      type: 'image/png',
    });
    const imageUrl = URL.createObjectURL(imageBlob);
    dispatch(setUserImg(imageUrl));
    setInputImg(imageUrl);
  };

  const checkDuplicate = async (): Promise<boolean> => {
    console.log('보내는 이름', inputName);
    const response = await sendRequest('post', `/users/username/`, router, {
      name: inputName,
    });
    if (response.status < 300) return true;
    else if (response.status === 404) router.push('/notFound');
    return false;
  };

  const updateUserInfo = async () => {
    if (
      isValid('유저네임이', inputName, maxUniqueNameLength, dispatch) === false
    )
      return;
    if ((await checkDuplicate()) === false) return;

    const response = await sendRequest('patch', '/users/update/', router, {
      userName: inputName ? inputName : null,
      require2fa: require2fa,
      profileImage: inputImg,
    });
    if (response.status < 300) {
      getUserInfo();
      getUserProfileImg();
      dispatch(setName(inputName));
      dispatch(setUserImg(inputImg!));
    } else {
      myAlert('error', 'sth went wrong', dispatch);
    }
    setInputName('');
  };

  const handle2faChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequire2fa(event.target.checked);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
  };

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (imageUrl) {
        setInputImg(imageUrl);
      }
    }
  };

  const logout = async () => {
    try {
      const response = await sendRequest('post', `/auth/logout`, router);
      removeCookie('access_token');
      removeCookie('refresh_token');
      router.push('/');
    } catch (error) {
      console.log('로그아웃 실패!', error);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => {
          router.push('/home');
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <List>
        <ListItem key="userName" divider>
          <ListItemText primary={`유저 이름: ${myName ? myName : ''}`} />
          <TextField
            id="outlined-basic"
            label="uniqueName"
            variant="outlined"
            value={inputName}
            onChange={handleNameChange}
          />
          {/* //TODO 여기에 아이디 중복 확인 버튼 필요 */}
        </ListItem>
        {/* <Button={}></Button=> */}
        <ListItem key="require2fa" divider>
          <ListItemText primary={`2fa 설정: `} />
          <Typography>Off</Typography>
          <Switch checked={require2fa} onChange={handle2faChange} />
          <Typography>On</Typography>
        </ListItem>
        <ListItem key="userImg" divider>
          {inputImg && <Avatar src={inputImg} />}
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            이미지 업로드 하기
            <VisuallyHiddenInput type="file" onChange={handleImageUpload} />
          </Button>
        </ListItem>
      </List>
      <ButtonGroup sx={{ gap: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={async () => await updateUserInfo()}
        >
          변경하기
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            router.push('/home');
          }}
        >
          돌아가기
        </Button>
        <Button variant="contained" onClick={logout}>
          로그아웃
        </Button>
      </ButtonGroup>
    </>
  );
};

const Setting = () => {
  return (
    <Provider store={store}>
      <SettingInfo />
    </Provider>
  );
};

export default Setting;
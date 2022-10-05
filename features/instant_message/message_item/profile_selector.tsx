import { Avatar, Box, Button, Icon, Input } from '@chakra-ui/react';
import { useState } from 'react';

const DEFAULT_PROFILE = '/profile_anonymous.png';

const profileArr = [
  '/profile_anonymous.png',
  '/profile_dokgo.png',
  '/profile_girl.png',
  '/profile_owner.png',
  '/profile_rider.png',
  '/profile_cs.png',
];

interface Props {
  selectedProfile: string | null;
  onSelectedProfile: (data: { type: 'SELECTED' | 'UPLOADED'; url: string }) => void;
}

const ProfileSelector = function ({ selectedProfile, onSelectedProfile }: Props) {
  const [isCustom, setCustomMode] = useState(false);
  const [profileImg, setProfileImg] = useState(selectedProfile ?? DEFAULT_PROFILE);
  return (
    <Box>
      <Box>
        {profileArr.map((item) => (
          <Button
            variant="link"
            borderRadius="full"
            _focus={{ bg: 'none' }}
            padding="2px"
            onClick={() => {
              setCustomMode(false);
              setProfileImg(item);
              onSelectedProfile({ type: 'SELECTED', url: item });
            }}
          >
            <Avatar
              src={item}
              border="4px"
              color={isCustom === false && profileImg === item ? 'blackAlpha.500' : 'white'}
            />
          </Button>
        ))}
        <Button
          variant="link"
          borderRadius="full"
          _focus={{ bg: 'none' }}
          padding="2px"
          onClick={() => {
            setCustomMode(true);
          }}
        >
          <Icon viewBox="0 0 99.09 122.88" boxSize={10} border="4px" color={isCustom ? 'blackAlpha.500' : 'white'}>
            <path d="M64.64,13,86.77,36.21H64.64V13ZM42.58,71.67a3.25,3.25,0,0,1-4.92-4.25l9.42-10.91a3.26,3.26,0,0,1,4.59-.33,5.14,5.14,0,0,1,.4.41l9.3,10.28a3.24,3.24,0,0,1-4.81,4.35L52.8,67.07V82.52a3.26,3.26,0,1,1-6.52,0V67.38l-3.7,4.29ZM24.22,85.42a3.26,3.26,0,1,1,6.52,0v7.46H68.36V85.42a3.26,3.26,0,1,1,6.51,0V96.14a3.26,3.26,0,0,1-3.26,3.26H27.48a3.26,3.26,0,0,1-3.26-3.26V85.42ZM99.08,39.19c.15-.57-1.18-2.07-2.68-3.56L63.8,1.36A3.63,3.63,0,0,0,61,0H6.62A6.62,6.62,0,0,0,0,6.62V116.26a6.62,6.62,0,0,0,6.62,6.62H92.46a6.62,6.62,0,0,0,6.62-6.62V39.19Zm-7.4,4.42v71.87H7.4V7.37H57.25V39.9A3.71,3.71,0,0,0,61,43.61Z" />
          </Icon>
        </Button>
      </Box>
      {isCustom && (
        <Input
          pt="2"
          mb="2"
          placeholder="select image file"
          type="file"
          name="file"
          onChange={(changeEvent) => {
            const reader = new FileReader();
            reader.onload = (onLoadEvent) => {
              if (onLoadEvent.target !== null && onLoadEvent.target.result !== null) {
                const tempImg = new Image();
                tempImg.src =
                  typeof onLoadEvent.target.result === 'string'
                    ? onLoadEvent.target.result
                    : onLoadEvent.target.result.toString();
                tempImg.onload = () => {
                  if (tempImg.width !== 128 || tempImg.height !== 128) {
                    alert('프로필 이미지는 128x128 사이즈만 지원합니다');
                    return;
                  }
                  onSelectedProfile({
                    type: 'UPLOADED',
                    url:
                      typeof onLoadEvent.target!.result! === 'string'
                        ? onLoadEvent.target!.result!
                        : onLoadEvent.target!.result!.toString(),
                  });
                };
              }
            };
            if (changeEvent.target.files !== undefined && changeEvent.target.files !== null) {
              reader.readAsDataURL(changeEvent.target.files[0]);
            }
          }}
        />
      )}
    </Box>
  );
};

export default ProfileSelector;

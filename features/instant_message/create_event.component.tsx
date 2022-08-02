import { Box, Button, ButtonGroup, Flex, FormControl, FormLabel, Input, Spacer, Textarea } from '@chakra-ui/react';
import { DatePicker } from 'antd';
import { useRef, useState } from 'react';
import moment, { Moment } from 'moment';

const { RangePicker } = DatePicker;

const afterTwoWeekMoment = moment().add(2, 'week');

const CreateEvent = function ({
  onClickSave,
  onClose,
}: {
  onClickSave: (data: {
    title: string;
    desc?: string;
    startDate?: string;
    endDate?: string;
    titleImg?: string;
    bgImg?: string;
  }) => void;
  onClose: () => void;
}) {
  const initialRef = useRef<any>();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const tempStartDate = moment();
  const tempEndDate = moment(tempStartDate).add({ days: 1 });
  const [dateRange, setDateRange] = useState<[Moment | null, Moment | null]>([tempStartDate, tempEndDate]);
  const [titleImageSrc, setTitleImageSrc] = useState<string | ArrayBuffer | null>(null);
  const [bgImageSrc, setBGImageSrc] = useState<string | ArrayBuffer | null>(null);

  async function extractData() {
    let titleImgUrl: string | null = null;
    if (titleImageSrc !== null && typeof titleImageSrc === 'string') {
      // 타이틀 이미지 전송
      const titleImageResp = await fetch('/api/image.add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: titleImageSrc }),
      });
      const titleImageRespData = await titleImageResp.json();
      titleImgUrl = titleImageRespData.secure_url;
    }
    let bgImgUrl: string | null = null;
    if (bgImageSrc !== null && typeof bgImageSrc === 'string') {
      // 타이틀 이미지 전송
      const bgImageResp = await fetch('/api/image.add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: bgImageSrc }),
      });
      const bgImageRespData = await bgImageResp.json();
      bgImgUrl = bgImageRespData.secure_url;
    }
    const saveData = {
      title,
      desc,
      startDate: dateRange[0] !== null ? dateRange[0].toISOString() : undefined,
      endDate: dateRange[1] !== null ? dateRange[1].toISOString() : undefined,
      titleImg: titleImgUrl ?? undefined,
      bgImg: bgImgUrl ?? undefined,
    };
    return saveData;
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" p="2" mt="6" bg="white">
      <FormControl isRequired>
        <FormLabel>이벤트 이름</FormLabel>
        <Input
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          ref={initialRef}
          placeholder="질문 목록 이름"
        />
      </FormControl>

      <FormControl mt={4}>
        <FormLabel>설명</FormLabel>
        <Textarea
          onChange={(e) => {
            setDesc(e.target.value);
          }}
          placeholder="설명"
        />
      </FormControl>
      <FormControl mt={4} isRequired>
        <FormLabel>질문 가능 날짜</FormLabel>
        <RangePicker
          size="large"
          value={dateRange}
          disabledDate={(current) => current < moment().endOf('day') || current > afterTwoWeekMoment}
          onChange={(v) => {
            if (v !== null) setDateRange(v);
          }}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          style={{ width: '100%' }}
        />
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>타이틀 이미지</FormLabel>
        <Input
          placeholder="select image file"
          type="file"
          name="file"
          onChange={(changeEvent) => {
            const reader = new FileReader();
            reader.onload = (onLoadEvent) => {
              if (onLoadEvent.target !== null && onLoadEvent.target.result !== null) {
                setTitleImageSrc(onLoadEvent.target.result);
              }
            };
            if (changeEvent.target.files !== undefined && changeEvent.target.files !== null) {
              reader.readAsDataURL(changeEvent.target.files[0]);
            }
          }}
        />
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>배경 이미지</FormLabel>
        <Input
          placeholder="select image file"
          type="file"
          name="file"
          onChange={(changeEvent) => {
            const reader = new FileReader();
            reader.onload = (onLoadEvent) => {
              if (onLoadEvent.target !== null && onLoadEvent.target.result !== null) {
                setBGImageSrc(onLoadEvent.target.result);
              }
            };
            if (changeEvent.target.files !== undefined && changeEvent.target.files !== null) {
              reader.readAsDataURL(changeEvent.target.files[0]);
            }
          }}
        />
      </FormControl>
      <Flex>
        <Spacer />
        <ButtonGroup variant="outline" spacing="6" mt="2">
          <Button
            colorScheme="blue"
            onClick={() => {
              extractData().then((data) => {
                onClickSave(data);
              });
            }}
          >
            저장
          </Button>
          <Button
            onClick={() => {
              onClose();
            }}
          >
            닫기
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};

export default CreateEvent;

import { useCallback } from 'react';
import { TextField } from '@mui/material'
import { AdapterDayjs, } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import 'dayjs/locale/ru';
import dayjs from 'dayjs';

interface IBasicDateTimePicker {
  value: number;
  onChange: (newDate: number) => void;
  label: string;
}

interface IDateTimePickerValue {
  $d: Date
}

export default function BasicDateTimePicker({value, onChange, label}: IBasicDateTimePicker) {
  const onChangeHandler = useCallback((val: dayjs.Dayjs) => onChange(Number(val.valueOf())), [onChange])
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <DateTimePicker
        renderInput={(props) => <TextField {...props} />}
        label={label}
        value={value}
        onChange={onChangeHandler}
      />
    </LocalizationProvider>
  );
}

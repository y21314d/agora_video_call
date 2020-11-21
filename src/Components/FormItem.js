import React from 'react';
import { Input } from 'antd'

const FormItem = ((props) => {
  return (
    <div className="mg-15-0" >
      <span className='input-title'>{props.title}</span>
      <Input placeholder={props.placeholder} value={props.value} onChange={props.onChange} allowClear='true' />
    </div>
  )
})

export default FormItem

#include "pxt.h"


#include "MicroBit.h"

#ifndef MICROBIT_CODAL
#ifdef CODAL_CONFIG_H
#define MICROBIT_CODAL 1
#else
#define MICROBIT_CODAL 0
#endif
#endif

#if MICROBIT_CODAL

#else // MICROBIT_CODAL



class PullMode
{
public:
    PinMode pm;

    PullMode()            : pm( PullNone) {};
    PullMode( uint8_t p)  : pm( (PinMode)p) {};
    PullMode( PinMode p)  : pm( p) {};

    static const PinMode None = PullNone;
    static const PinMode Down = PullDown;
    static const PinMode Up   = PullUp;

    operator PinMode() { return pm; }
    operator uint8_t() { return pm; }
};

#endif // MICROBIT_CODAL

//% color=50 weight=80
//% icon="\uf1eb"
namespace maqueenIRV2 { 
int ir_code = 0x00;
int ir_addr = 0x00;
int data1 = 0;
int data;

int logic_value(){//判断逻辑值"0"和"1"子函数
    uint32_t lasttime = system_timer_current_time_us();
    uint32_t nowtime;
    while(!uBit.io.P16.getDigitalValue());//低等待
    nowtime = system_timer_current_time_us();
    //uBit.serial.printf("3 %d\r\n",(nowtime - lasttime));
    if((nowtime - lasttime) > 460 && (nowtime - lasttime) < 660){//低电平560us
        while(uBit.io.P16.getDigitalValue());//是高就等待
        lasttime = system_timer_current_time_us();
        //uBit.serial.printf("%d\r\n",(lasttime - nowtime));
        if((lasttime - nowtime)>460 && (lasttime - nowtime) < 660){//接着高电平560us
            return 0;
        }else if((lasttime - nowtime)>1600 && (lasttime - nowtime) < 1800){//接着高电平1.7ms
            return 1;
       }
    }
//uBit.serial.printf("error\r\n");
    return -1;
}

void pulse_deal(){
    int i;
    ir_addr=0x00;//清零
    for(i=0; i<16;i++ )
    {
      if(logic_value() == 1)
      {
        ir_addr |=(1<<i);
      }
    }
    //解析遥控器编码中的command指令
    ir_code=0x00;//清零
    for(i=0; i<16;i++ )
    {
      if(logic_value() == 1)
      {
        ir_code |=(1<<i);
      }
    }

}

void remote_decode(void){
    data = 0x00;
    uint32_t lasttime = system_timer_current_time_us();
    uint32_t nowtime;
    while(uBit.io.P16.getDigitalValue()){//高电平等待
    //uBit.serial.printf("1\r\n");
        nowtime = system_timer_current_time_us();
        if((nowtime - lasttime) > 100000){//超过100 ms,表明此时没有按键按下
            ir_code = 0xffff;
            return;
        }
    }
    //uBit.serial.printf("2\r\n");
    //如果高电平持续时间不超过100ms
    lasttime = system_timer_current_time_us();
    while(!uBit.io.P16.getDigitalValue());//低等待
    //uBit.serial.printf("3\r\n");
    nowtime = system_timer_current_time_us();
    //uBit.serial.printf("1 %d\r\n",(nowtime - lasttime));
    if((nowtime - lasttime) < 9100 && (nowtime - lasttime) > 8800){//9ms
        while(uBit.io.P16.getDigitalValue());//高等待
        lasttime = system_timer_current_time_us();
        //uBit.serial.printf("1 %d\r\n",(lasttime - nowtime));
        if((lasttime - nowtime) > 4400 && (lasttime - nowtime) < 4510){//4.5ms,接收到了红外协议头且是新发送的数据。开始解析逻辑0和1
            pulse_deal();
            //uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
            //uBit.serial.printf("1\r\n");
            data = data1 = ir_code;
            
            return;//ir_code;
        }else if((lasttime - nowtime) > 2150 && (lasttime - nowtime) < 2260){//2.25ms,表示发的跟上一个包一致
        
            while(!uBit.io.P16.getDigitalValue());//低等待
            nowtime = system_timer_current_time_us();
            if((nowtime - lasttime) > 460 && (nowtime - lasttime) < 660){//560us
                //uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
                //uBit.serial.printf("2\r\n");
                data = data1;
                
                return;//ir_code;
            }
        }
    }
}

 //% 
int irCode(){
    PullMode pullmode = PullMode::Up;
    uBit.io.P16.setPull(pullmode);
    remote_decode();
    return data;
}

}

import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {


  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t border-gray-200'>
      <Title text1={'ABOUT'} text2={'US'}></Title>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta suscipit amet temporibus atque et odit expedita, voluptatibus ab cumque ullam reiciendis ratione tempora at veniam? Cumque doloribus culpa nobis? Qui.</p>
          <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Pariatur nisi tenetur, ipsa illum numquam corporis nam velit magni facilis commodi sint perspiciatis fugiat officiis rerum saepe rem nostrum corrupti eveniet!</p>
          <b className='text-gray-800'>Our Mission</b>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium perspiciatis molestiae neque vel quam nisi, possimus quidem error tempore? Repellat illum ducimus assumenda doloremque perspiciatis atque, earum veritatis deleniti deserunt?</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}></Title>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border border-gray-200 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, pariatur repellendus alias totam illum, aut porro numquam dolorem excepturi debitis blanditiis distinctio molestias accusantium culpa recusandae expedita ad error esse?</p>
        </div>
        <div className='border border-gray-200 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, pariatur repellendus alias totam illum, aut porro numquam dolorem excepturi debitis blanditiis distinctio molestias accusantium culpa recusandae expedita ad error esse?</p>
        </div>
        <div className='border border-gray-200 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, pariatur repellendus alias totam illum, aut porro numquam dolorem excepturi debitis blanditiis distinctio molestias accusantium culpa recusandae expedita ad error esse?</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About

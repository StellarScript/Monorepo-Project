import Image from 'next/image';

export const LogoImage = () => (
   <Image
      className="w-auto h-9"
      width={150}
      height={36}
      src={'https://landingfoliocom.imgix.net/store/collection/dusk/images/logo.svg'}
      alt={'logo image'}
   />
);

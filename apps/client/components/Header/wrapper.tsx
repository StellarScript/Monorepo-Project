type Props = {
   children: React.ReactNode;
   className?: string;
};

const HeaderWrapper: React.FC<Props> = ({ children, className }) => (
   <header className={`w-full px-8 ${className}`}>
      <div className="py-6">{children}</div>
   </header>
);

export default HeaderWrapper;

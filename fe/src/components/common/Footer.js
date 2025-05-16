const Footer = () => {
    return (
        <footer className="py-6 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">© 2025 BookleTalk. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-500">이용약관</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-500">개인정보처리방침</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-500">고객센터</a>
            </div>
          </div>
        </div>
      </footer>
    );
};
export default Footer;
import { Button, Result } from 'antd';
import { useHistory } from 'react-router-dom';

const UnauthorizedPage = ({title,subTitle}) => {
  const history = useHistory();

  return (
    <Result
      status="warning"
      title={title}
      subTitle={subTitle}
      iconFond
      extra={
        <Button type="primary" onClick={() => history.goBack()}>
          Go Back
        </Button>
      }
    />
  );
};


export default UnauthorizedPage;

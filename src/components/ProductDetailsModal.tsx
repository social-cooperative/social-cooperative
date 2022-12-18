import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography }from '@mui/material';
import styled from 'styled-components';

  
interface IProductDetails {
    name: string;
    description: string;
    about: string;
};

interface IAlertDialog {
    isOpened: boolean;
    details: IProductDetails;
    onClose: () => void;
}

const Root = styled.div`
    text-align: left;
    min-width: 540px;
    min-height: 400px;
`

const Heading = styled.h4`
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.1px;
`

const Description = styled.p`
    font-size: 18px;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 18px;
`

const About = styled.p`
    font-size: 17px;
    font-weight: 400;
    line-height: 1.5;
`

export default function ProductDetailsModal({ isOpened, onClose, details }: IAlertDialog) {
  return (
        <Dialog
        open={isOpened}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                <Heading>
                    {details.name}
                </Heading>
            </DialogTitle>
            <DialogContent id="alert-dialog-description">
                <Root>
                    <Description>
                        {details.description}
                    </Description>
                    <About>
                        {details.about}
                    </About>
                </Root>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
  );
}
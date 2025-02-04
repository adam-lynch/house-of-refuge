import {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useFormik} from 'formik';
import axios from 'axios';
import {getCookie} from "../scripts/utils";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  max-width: 400px;
  margin-top: 32px;
  margin-bottom: 32px;
  padding: 6px;
`;

const Label = styled.label`
  font-weight: 700;
  font-size: 16.88px;
  line-height: 19px;
  margin-top: 28px;
  margin-left: ${p => p.type === 'checkbox' ? '20px' : 'initial'};
  position: ${p => p.type === 'checkbox' ? 'absolute' : 'initial'};
  cursor: ${p => p.type === 'checkbox' ? 'pointer' : 'initial'};
  `;

const SubHeading = styled.span`
  font-weight: 400;
  font-size: 13.5px;
  line-height: 16px;
  margin-top: 3px;
  margin-left: ${p => p.indent ? '20px' : 0};
`;

const CustomIntRange = styled.span`
  justify-content: space-between;
  display: flex;

   > input {
       width: calc(50% - 8px);
   }
`;


const Input = styled.input.attrs(({type}) => ({
  as: type === 'textarea' ? type : 'input'
}))`
  height: ${p => p.type === 'checkbox' ? '22px' : '44px'};
  cursor: ${p => p.type === 'checkbox' ? 'pointer' : 'initial'};
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid #898F9C;
  min-height: ${p => p.type === 'textarea' ? '70px' : 'initial'};
  max-height: ${p => p.type === 'textarea' ? '140px' : 'initial'};
  padding-top: ${p => p.type === 'textarea' ? '8px' : 'initial'};
  margin-top: ${p => p.type === 'checkbox' ? '27px' : '10px'};

`;

const RadioField = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
`;

const RadioChoice = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 28px;

  span {
      margin-left: 6px;
      font-size: 14px;
  }
`;

const SelectField = styled.select`
  height: 44px;
  cursor: pointer;
  padding-left: 6px;
  margin-top: 10px;
`;


const Button = styled.button`
  margin-top: 36px;
  padding: 0;
  cursor: pointer;
  width: 100%;
  height: 40px;
  border: none;
  background-color: black;
  border-radius: 150px;
  color: #fff;
  background-color: #000;
`;

const Alert = styled.div`
  font-size: 13px;
  margin-top: 6px;
  color: #d93025;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;

  * {
    color:  ${p => p.alert ? '#D93025' : 'inherit'};
  }
`;

const Success = styled.div`
  font-size: 21px;
  margin: 50px auto;
  text-align: center;
`;

const Primary = styled.div`
   font-size: 34px;
   font-weight: 700;
   margin-top: 80px;
   text-align: center;

   @media (max-width: 600px) {
      font-size: 24px;
   }
`;

const Secondary = styled.div`
   font-size: 18px;
   text-align: center;

   @media (max-width: 600px) {
       font-size: 16px;
    }
`;

const Info = styled.div`
   font-size: 14px;
   text-align: center;
   margin-top: ${p => p.marginTop + 'px'};

   span {
    color: #fff;
    padding: 0 6px;
    background-color: #212121;
   }
`;


const Form = ({fields, validationSchema, url, successInfo, user, primaryText, secondaryText}) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [whenToCall, setWhenToCall] = useState('9—22');

  useEffect(() => {
    formik.setFieldValue('when_to_call', whenToCall);
  }, [whenToCall]);

  useEffect(() => {
    !user && formik.setFieldValue('source', 'webform');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [error]);

  const shouldRenderField = (field) => {
    if (field.publicOnly) {
      return !user;
    } else if (field.loggedUser) {
      return user;
    }
    return true;
  };

  console.log('user: ', user);
  const formik = useFormik({
    initialValues: fields.filter(field => shouldRenderField(field)).reduce((acc, field) => (acc[field.name] =
        field.type === 'checkbox' ? true :
            field.type === 'select' ? field.options[0].value :
                field.type === 'date' ? new Date().toISOString().split('T')[0] :
                    field.name === 'receiver' && user ? user.id :
                        '', acc), {}),
    validationSchema: validationSchema({publicOnly: !user}),
    onSubmit: async (values, {resetForm}) => {
      const {city, ...rest} = values;
      const cityZipCodeValues = {
        ...rest,
        city_and_zip_code: `${values.city}, ${values.zip_code}`,
      };
      return axios({
        method: 'post',
        url,
        data: values.city && values.zip_code ? cityZipCodeValues : values,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      })
          .catch(error => {
            console.log("TADEK ERROR: ", error);
            error && setError(true);
          })
          .then(res => {
            console.log("TADEK RESPONSE:", res);
            if (res) {
              setSuccess(true);
              if (res.status === 201) {
                setSuccess(true);
                resetForm();
              } else {
                setError(true);
              }
            }
          });
    }
  });

  return (
      success ? <><Success>
            {successInfo}</Success>
            <div style={{maxWidth: "300px", margin: "auto"}}>
              <Button onClick={() => setSuccess(false)}>Dodaj kolejne</Button>
            </div>
          </> :
          <>
            <Primary> {primaryText} </Primary>
            <Secondary> {secondaryText} </Secondary>
            {user && <Info marginTop={48}> <span> Zalogowany: {user.name} </span> </Info>}
            {/*{error && <Info marginTop={3} > Błąd serwera. Spróbuj jeszcze raz. </Info>}*/}

            <StyledForm onSubmit={formik.handleSubmit}>
              {fields
                  .filter(field => user ? field : !field.loggedUser)
                  .filter(field => !user ? field : !field.publicOnly)
                  .map(field => {
                    return <Field key={field.name} alert={formik.errors[field.name] && formik.touched[field.name]}>
                      {field.type === 'hidden' || field.type === 'checkbox' ? null :
                          <>
                            <Label htmlFor={field.name}>{field.label}</Label>
                            {field.subHeading && <SubHeading> {field.subHeading}</SubHeading>}
                          </>}
                      {field.type === 'radio' ?
                          <RadioField>
                            {field.choice.map(choice => {
                              return <RadioChoice key={choice.value}>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={choice.value}
                                    onChange={formik.handleChange}
                                />
                                <span>{choice.label}</span>
                              </RadioChoice>;
                            })}
                          </RadioField>
                          : field.type === 'select' ?
                              <SelectField
                                  name={field.name}
                                  value={field.value}
                                  onChange={formik.handleChange}
                              >
                                {field.options.map(option => <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>)}
                              </SelectField>
                              : field.type === 'custom_int_range' && field.name === 'when_to_call' ?
                                  <CustomIntRange>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="number"
                                        onChange={(e) => setWhenToCall(e.currentTarget.value + '—' + whenToCall.split('—')[1])}
                                        value={whenToCall.split('—')[0]}
                                        onWheel={(e) => e.target.blur()}
                                        min={0}
                                        max={24}
                                    />
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="number"
                                        onWheel={(e) => e.target.blur()}
                                        onChange={(e) => setWhenToCall(whenToCall.split('—')[0] + '—' + e.currentTarget.value)}
                                        value={whenToCall.split('—')[1]}
                                        min={0}
                                        max={24}
                                    />
                                  </CustomIntRange>
                                  : <Input
                                      id={field.name}
                                      name={field.name}
                                      type={field.type}
                                      onChange={formik.handleChange}
                                      onWheel={(e) => e.target.blur()}
                                      value={formik.values[field.name]}
                                      min={field.type === 'number' ? 1 : null}
                                      max={field.type === 'number' ? 100 : null}
                                  />
                      }
                      {field.type === 'checkbox' ? <>
                        <Label type="checkbox" htmlFor={field.name}>{field.label}</Label>
                        {field.subHeading && <SubHeading indent> {field.subHeading}</SubHeading>}
                      </> : null}
                      {formik.errors[field.name] && formik.touched[field.name] ? (
                          <Alert role="alert"> {formik.errors[field.name]} </Alert>
                      ) : null}
                    </Field>;
                  })}

              <Button
                  type="submit"
                  disabled={formik.isSubmitting}
              >
                Wyślij
              </Button>

            </StyledForm>
          </>

  );
};

export default Form;

import React from "react";
import styled from "styled-components";
interface Props {
  data: any;
}

const GitHubUser = styled.div`
  display: inline-flex;
  flex-direction: row;
  flex-basis: 100%;
  justify-content: center;
  opacity: 0;
  &.selected {
    animation: opac 1s linear;
    opacity: 1;
  }
`;
const Avatar = styled.div`
  img {
    width: 95%;
    box-shadow: 0px 3px 5px 5px lightgray;
  }
  flex: 1;
  justify-content: left;
  display: inline-flex;
  height: 200px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  line-height: 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid lightgray;
  label {
    flex: 1;
    text-align: left;
    text-transform: uppercase;
    font-weight: 600;
  }
  span {
    flex: 2;
    text-align: left;
  }
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 2;
  max-height: 600px;
  scroll-behavior: smooth;
  overflow: auto;
`;
const renderFields = (data: any) => {
  const keys = Object.keys(data);
  if (keys.length)
    return keys.map((k: any, i: number) => {
      return (
        <Field key={i}>
          <label>{k.replace(/_/g, " ")}</label>
          <span>{data[k]}</span>
        </Field>
      );
    });
  return <></>;
};

export const SelectedUser: React.FC<Props> = (props: Props) => {
  return (
    <GitHubUser className={props.data ? 'selected': ''}>
      {props.data ? (
        <React.Fragment>
          <Avatar>
            <img src={props.data.avatar_url} alt={props.data.login} />
          </Avatar>
          <FieldContainer>{renderFields(props.data)}</FieldContainer>
        </React.Fragment>
      ) : (
        <h3>No Selected User Information to Show</h3>
      )}
    </GitHubUser>
  );
};

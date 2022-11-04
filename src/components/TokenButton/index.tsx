import { components } from "api/portals-schema";
import cls from "classnames";
import Image from "next/image";
import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from "react";
import st from "./token-button.module.scss";

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  token?: components["schemas"]["Token"];
}

const TokenButton: FC<Props> = ({ token, children, className, ...props }) => {
  return (
    <button className={cls(st.tokenButton, className)} {...props}>
      {!!token ? (
        <>
          {token?.image && (
            <Image src={token.image} alt={token.name} width={30} height={30} />
          )}
          <span className={st.tokenInfo}>
            <span className={st.tokenSymbol}>{token?.symbol}</span>
            <span className={st.tokenName}>{token?.name}</span>
          </span>
          <span className={st.netPlat}>{token?.network}</span>
        </>
      ) : (
        "Select a token"
      )}
    </button>
  );
};

export default TokenButton;

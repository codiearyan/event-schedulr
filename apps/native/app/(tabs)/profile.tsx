import { Image } from "react-native";
import { Container } from "@/components/container";
export default function Profile() {
	return (
		<Container>
			<Image
				source={{
					uri: "https://img.logo.dev/stripe.com?token=pk_ZNfAm0FmTUWhOmTGfk_HJw",
				}}
				className="h-12 w-12 rounded-xl bg-bg-card"
			/>
		</Container>
	);
}

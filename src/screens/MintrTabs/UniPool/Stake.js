import React, { useState, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import snxJSConnector from '../../../helpers/snxJSConnector';

import { bigNumberFormatter, formatCurrency } from '../../../helpers/formatters';
import TransactionPriceIndicator from '../../../components/TransactionPriceIndicator';
import { updateGasLimit } from '../../../ducks/network';
import { getWalletDetails } from '../../../ducks/wallet';

import { PageTitle, PLarge, ButtonTertiaryLabel } from '../../../components/Typography';
import DataBox from '../../../components/DataBox';
import { ButtonTertiary, ButtonPrimary } from '../../../components/Button';

import UnipoolActions from '../../UnipoolActions';

const TRANSACTION_DETAILS = {
	stake: {
		contractFunction: 'stake',
		gasLimit: 120000,
	},
	claim: {
		contractFunction: 'getReward',
		gasLimit: 200000,
	},
	unstake: {
		contractFunction: 'withdraw',
		gasLimit: 125000,
	},
	exit: {
		contractFunction: 'exit',
		gasLimit: 250000,
	},
};

const Stake = ({ walletDetails, updateGasLimit }) => {
	const { t } = useTranslation();
	const { unipoolContract } = snxJSConnector;
	const [balances, setBalances] = useState(null);
	const [currentScenario, setCurrentScenario] = useState({});
	const { currentWallet } = walletDetails;

	const fetchData = useCallback(async () => {
		if (!snxJSConnector.initialized) return;
		try {
			const { uniswapContract, unipoolContract } = snxJSConnector;
			const [univ1Held, univ1Staked, rewards] = await Promise.all([
				uniswapContract.balanceOf(currentWallet),
				unipoolContract.balanceOf(currentWallet),
				unipoolContract.earned(currentWallet),
			]);
			setBalances({
				univ1Held: bigNumberFormatter(univ1Held),
				univ1HeldBN: univ1Held,
				univ1Staked: bigNumberFormatter(univ1Staked),
				univ1StakedBN: univ1Staked,
				rewards: bigNumberFormatter(rewards),
			});
			updateGasLimit(TRANSACTION_DETAILS.stake.gasLimit);
		} catch (e) {
			console.log(e);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentWallet, snxJSConnector.initialized]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (!currentWallet) return;
		const { unipoolContract } = snxJSConnector;

		unipoolContract.on('Staked', user => {
			if (user === currentWallet) {
				fetchData();
			}
		});

		unipoolContract.on('Withdrawn', user => {
			if (user === currentWallet) {
				fetchData();
			}
		});

		unipoolContract.on('RewardPaid', user => {
			if (user === currentWallet) {
				fetchData();
			}
		});

		return () => {
			if (snxJSConnector.initialized) {
				unipoolContract.removeAllListeners('Staked');
				unipoolContract.removeAllListeners('Withdrawn');
				unipoolContract.removeAllListeners('RewardPaid');
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentWallet]);

	return (
		<Container>
			<UnipoolActions {...currentScenario} onDestroy={() => setCurrentScenario({})} />
			<Navigation>
				<ButtonTertiary
					as="a"
					target="_blank"
					href={`https://etherscan.io/address/${unipoolContract.address}`}
				>
					{t('unipool.buttons.goToContract')} ↗
				</ButtonTertiary>
			</Navigation>
			<PageTitle>{t('unipool.title')}</PageTitle>
			<PLarge>{t('unipool.unlocked.subtitle')}</PLarge>
			<PLarge>
				<Link href="https://blog.synthetix.io/new-uniswap-seth-lp-reward-system/" target="_blank">
					<ButtonTertiaryLabel>{t('unipool.unlocked.link')}</ButtonTertiaryLabel>
				</Link>
			</PLarge>
			<BoxRow>
				<DataBox
					heading={t('unipool.unlocked.data.balance')}
					body={`${balances ? formatCurrency(balances.univ1Held) : 0} UNI-V1`}
				/>
				<DataBox
					heading={t('unipool.unlocked.data.staked')}
					body={`${balances ? formatCurrency(balances.univ1Staked) : 0} UNI-V1`}
				/>
				<DataBox
					heading={t('unipool.unlocked.data.rewardsAvailable')}
					body={`${balances ? formatCurrency(balances.rewards) : 0} SNX`}
				/>
			</BoxRow>
			<ButtonBlock>
				<ButtonRow>
					<ButtonAction
						disabled={!balances || !balances.univ1Held}
						onClick={() =>
							setCurrentScenario({
								action: 'stake',
								label: t('unipool.unlocked.actions.staking'),
								amount: `${balances && formatCurrency(balances.univ1Held)} UNI-V1`,
								param: balances && balances.univ1HeldBN,
								...TRANSACTION_DETAILS['stake'],
							})
						}
					>
						{t('unipool.buttons.stake')}
					</ButtonAction>
					<ButtonAction
						disabled={!balances || !balances.rewards}
						onClick={() =>
							setCurrentScenario({
								action: 'claim',
								label: t('unipool.unlocked.actions.claiming'),
								amount: `${balances && formatCurrency(balances.rewards)} SNX`,
								...TRANSACTION_DETAILS['claim'],
							})
						}
					>
						{t('unipool.buttons.claim')}
					</ButtonAction>
				</ButtonRow>
				<ButtonRow>
					<ButtonAction
						disabled={!balances || !balances.univ1Staked}
						onClick={() =>
							setCurrentScenario({
								action: 'unstake',
								label: t('unipool.unlocked.actions.unstaking'),
								amount: `${balances && formatCurrency(balances.univ1Staked)} UNI-V1`,
								param: balances && balances.univ1StakedBN,
								...TRANSACTION_DETAILS['unstake'],
							})
						}
					>
						{t('unipool.buttons.unstake')}
					</ButtonAction>
					<ButtonAction
						disabled={!balances || (!balances.univ1Staked && !balances.rewards)}
						onClick={() =>
							setCurrentScenario({
								action: 'exit',
								label: t('unipool.unlocked.actions.exiting'),
								amount: `${balances && formatCurrency(balances.univ1Staked)} UNI-V1 & ${balances &&
									formatCurrency(balances.rewards)} SNX`,
								...TRANSACTION_DETAILS['exit'],
							})
						}
					>
						{t('unipool.buttons.exit')}
					</ButtonAction>
				</ButtonRow>
			</ButtonBlock>
			<TransactionPriceIndicator canEdit={true} />
		</Container>
	);
};

const Link = styled.a`
	text-decoration-color: ${props => props.theme.colorStyles.buttonTertiaryText};
`;

const Container = styled.div`
	min-height: 850px;
`;

const Navigation = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-bottom: 40px;
`;

const BoxRow = styled.div`
	margin-top: 42px;
	display: flex;
`;

const ButtonBlock = styled.div`
	margin-top: 58px;
`;

const ButtonRow = styled.div`
	display: flex;
	margin-bottom: 28px;
`;

const ButtonAction = styled(ButtonPrimary)`
	flex: 1;
	width: 10px;
	&:first-child {
		margin-right: 34px;
	}
`;

const mapStateToProps = state => ({
	walletDetails: getWalletDetails(state),
});

const mapDispatchToProps = {
	updateGasLimit,
};

export default connect(mapStateToProps, mapDispatchToProps)(Stake);
